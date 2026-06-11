import "server-only";
import { randomUUID } from "node:crypto";
import { SPECIES, SPECIES_BY_ID } from "@/data/species";
import { captureFeedPw, INITIAL_PW, FOOD_VALUES, PW_WEAK_THRESHOLD } from "@/lib/creature";
import { validPredatorsForFeed, invasiveForEcosystem } from "@/lib/feedRules";
import {
  consumePyramidJustCompleted,
  getDemoDiscoveredIds,
  getDemoInitialIndividuals,
  getDemoPyramidLevel,
  getTerrestrialRound,
  markTerrestrialPyramidCompleted,
  shouldSeedInitialPyramid,
} from "@/lib/demoState";
import { terrestrialPyramidSpecies } from "@/lib/demoScript";
import { DEMO_USER } from "@/lib/game";
import type { Ecosystem, FeedItem, Individual, Species } from "@/lib/types";

const USER_ID = DEMO_USER.id;

// Demo starting food pool (PW). Spending food on a creature deducts from this;
// capturing refills it.
const DEMO_FOOD_PW = 200;

let individuals: Individual[] = [];
let feeds: FeedItem[] = [];
let foodPw = DEMO_FOOD_PW;
/** Invasive species that have been isolated with a protection fence (保護柵). */
const fencedIds = new Set<string>();
/** Daily login bonus — applied once per calendar day. */
let lastLoginBonusDay: string | null = null;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Decay rules (spec §3 / §4.1):
 * - producers (trophic level 1) do NOT decay
 * - normal creatures: -1pw / 24h
 * - natives sharing a trophic level with an active UNFENCED invasive: extra -0.1pw / 24h
 */
function decayedIndividuals(): Individual[] {
  const now = Date.now();
  // levels threatened by an unfenced, alive invasive (per ecosystem+level)
  const threat = new Set(
    individuals
      .filter((i) => i.pw > 0 && !fencedIds.has(i.speciesId) && SPECIES_BY_ID[i.speciesId]?.invasive)
      .map((i) => {
        const sp = SPECIES_BY_ID[i.speciesId];
        return sp ? `${sp.ecosystem}:${sp.trophicLevel}` : "";
      }),
  );
  return individuals.map((ind) => {
    const sp = SPECIES_BY_ID[ind.speciesId];
    if (!sp || sp.trophicLevel === 1) return ind; // producers don't starve
    const last = new Date(ind.lastDecayAt).getTime();
    const days = Math.floor((now - last) / MS_PER_DAY);
    if (days <= 0) return ind;
    const invasivePressure = !sp.invasive && threat.has(`${sp.ecosystem}:${sp.trophicLevel}`) ? 0.1 : 0;
    const pw = Math.max(0, ind.pw - days * (1 + invasivePressure));
    return { ...ind, pw: Math.round(pw * 10) / 10, lastDecayAt: new Date(last + days * MS_PER_DAY).toISOString() };
  });
}

function persistIndividuals(next: Individual[]) {
  individuals = next;
}

function latestPwBySpecies(list: Individual[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const ind of list) {
    if (ind.pw <= 0) continue;
    const prev = map[ind.speciesId];
    if (prev === undefined || ind.pw > prev) map[ind.speciesId] = ind.pw;
  }
  return map;
}

function activeSpeciesIds(list: Individual[]): Set<string> {
  return new Set(list.filter((i) => i.pw > 0).map((i) => i.speciesId));
}

function upsertIndividual(speciesId: string, userId: string) {
  const now = new Date().toISOString();
  const list = decayedIndividuals();
  const existing = list.find((i) => i.speciesId === speciesId && i.userId === userId);
  if (existing) {
    persistIndividuals(
      list.map((i) =>
        i.id === existing.id
          ? { ...i, pw: INITIAL_PW, lastDecayAt: now, createdAt: now }
          : i,
      ),
    );
    return;
  }
  persistIndividuals([
    ...list,
    {
      id: randomUUID(),
      speciesId,
      userId,
      pw: INITIAL_PW,
      createdAt: now,
      lastDecayAt: now,
    },
  ]);
}

export function completeCapture(
  speciesId: string,
  options?: { feedOnly?: boolean },
): {
  feed: FeedItem;
  pwValue: number;
  onPyramid: boolean;
  pyramidComplete: boolean;
  newPyramidLevel: number;
} {
  const species = SPECIES_BY_ID[speciesId];
  if (!species) throw new Error("unknown_species");

  const pwValue = captureFeedPw(species);
  const feed: FeedItem = {
    id: randomUUID(),
    userId: USER_ID,
    sourceSpeciesId: speciesId,
    ecosystem: species.ecosystem,
    trophicLevel: species.trophicLevel,
    pwValue,
    createdAt: new Date().toISOString(),
  };
  foodPw += pwValue;

  const feedOnly = options?.feedOnly ?? false;
  if (!feedOnly) {
    upsertIndividual(speciesId, USER_ID);
  }

  let pyramidComplete = false;
  if (!feedOnly && isTerrestrialPyramidComplete()) {
    markTerrestrialPyramidCompleted();
    individuals = individuals.filter(
      (i) => SPECIES_BY_ID[i.speciesId]?.ecosystem !== "terrestrial",
    );
    pyramidComplete = true;
  }

  return {
    feed,
    pwValue,
    onPyramid: !feedOnly,
    pyramidComplete,
    newPyramidLevel: getDemoPyramidLevel(),
  };
}

function isTerrestrialPyramidComplete(): boolean {
  if (getTerrestrialRound() !== 1) return false;
  const slots = terrestrialPyramidSpecies().map((s) => s.id);
  const active = activeSpeciesIds(decayedIndividuals());
  return slots.every((id) => active.has(id));
}

function ensureDemoIndividuals() {
  if (individuals.length > 0) return;
  if (!shouldSeedInitialPyramid()) return;
  const now = new Date().toISOString();
  individuals = getDemoInitialIndividuals().map(({ speciesId, pw }) => ({
    id: randomUUID(),
    speciesId,
    userId: USER_ID,
    pw,
    createdAt: now,
    lastDecayAt: now,
  }));
}

/** Fixed, reusable food set — one card per size (1 / 3 / 9 pw). */
function ensureFeedsForDiscovered(_discovered: string[]) {
  if (feeds.some((f) => f.userId === USER_ID)) return;
  const now = new Date().toISOString();
  for (const pwValue of FOOD_VALUES) {
    feeds.push({
      id: `feed-${USER_ID}-${pwValue}`, // stable id so the card is always valid
      userId: USER_ID,
      sourceSpeciesId: "",
      ecosystem: "terrestrial",
      trophicLevel: 1,
      pwValue,
      createdAt: now,
    });
  }
}

export function getGameState(_discovered: string[]) {
  ensureDemoIndividuals();
  ensureFeedsForDiscovered([]);
  let list = decayedIndividuals().filter((i) => i.userId === USER_ID);

  // Daily login bonus: +1pw to every living creature, once a day.
  const today = new Date().toISOString().slice(0, 10);
  let loginBonus = false;
  if (lastLoginBonusDay !== today) {
    lastLoginBonusDay = today;
    loginBonus = true;
    list = list.map((i) => (i.pw > 0 ? { ...i, pw: i.pw + 1 } : i));
  }
  persistIndividuals(list);

  const discoveredSet = new Set(getDemoDiscoveredIds());
  const pyramidJustCompleted = consumePyramidJustCompleted();
  const pwMap = latestPwBySpecies(list);
  const activeIds = activeSpeciesIds(list);
  // Extinct: discovered creatures whose individual starved to 0 (kept, grayed out).
  const extinctIds = list.filter((i) => i.pw <= 0 && discoveredSet.has(i.speciesId)).map((i) => i.speciesId);

  const invasive: Record<Ecosystem, boolean> = {
    terrestrial: invasiveForEcosystem(
      new Set(list.filter((i) => i.pw > 0).map((i) => i.speciesId)),
      discoveredSet,
      "terrestrial",
    ),
    freshwater: invasiveForEcosystem(
      new Set(list.filter((i) => i.pw > 0).map((i) => i.speciesId)),
      discoveredSet,
      "freshwater",
    ),
    marine: invasiveForEcosystem(
      new Set(list.filter((i) => i.pw > 0).map((i) => i.speciesId)),
      discoveredSet,
      "marine",
    ),
  };

  return {
    feeds: feeds.filter((f) => f.userId === USER_ID),
    foodPw,
    pwMap,
    activeIds: [...activeIds],
    extinctIds,
    fencedIds: [...fencedIds],
    loginBonus,
    invasive,
    demoPyramidLevel: getDemoPyramidLevel(),
    pyramidJustCompleted,
  };
}

/** Place a protection fence (保護柵) around an invasive species. */
export function placeFence(speciesId: string): "ok" | "not-invasive" | "already" {
  const sp = SPECIES_BY_ID[speciesId];
  if (!sp?.invasive) return "not-invasive";
  if (fencedIds.has(speciesId)) return "already";
  fencedIds.add(speciesId);
  return "ok";
}

type FeedOk = { predatorName: string; gained: number; newPw: number; foodPw: number; recovered: boolean };
type FeedFail = "no-predator" | "invalid-target" | "no-food";

function applyFeedToSpecies(
  feed: FeedItem,
  targetSpeciesId: string,
  discovered: Set<string>,
): FeedOk | FeedFail {
  const predators = validPredatorsForFeed(feed, discovered);
  if (predators.length === 0) return "no-predator";
  if (!predators.some((p) => p.id === targetSpeciesId)) return "invalid-target";
  // Not enough food in the pool to spend this card.
  if (foodPw < feed.pwValue) return "no-food";

  let list = decayedIndividuals().filter((i) => i.userId === USER_ID);
  let target = list.find((i) => i.speciesId === targetSpeciesId && i.pw > 0);

  if (!target) {
    const now = new Date().toISOString();
    target = {
      id: randomUUID(),
      speciesId: targetSpeciesId,
      userId: USER_ID,
      pw: INITIAL_PW,
      createdAt: now,
      lastDecayAt: now,
    };
    list = [...list, target];
  }

  // Weak creature (pw < 3): feeding grants a +1 recovery bonus (ほっぺピンク♪).
  const recovered = target.pw > 0 && target.pw < PW_WEAK_THRESHOLD;
  const bonus = recovered ? 1 : 0;
  const newPw = target.pw + feed.pwValue + bonus;
  const gained = newPw - target.pw;
  persistIndividuals(
    list.map((i) => (i.id === target!.id ? { ...i, pw: newPw } : i)),
  );
  // Spending the food deducts its full value from the pool.
  foodPw = Math.max(0, foodPw - feed.pwValue);

  const predator = SPECIES_BY_ID[target.speciesId];
  return {
    predatorName: predator?.nameJa ?? "生き物",
    gained,
    newPw,
    foodPw,
    recovered,
  };
}

export function feedToTarget(
  feedId: string,
  targetSpeciesId: string,
  discovered: Set<string>,
): FeedOk | FeedFail | null {
  ensureFeedsForDiscovered([]); // make sure the denomination cards exist
  const feed = feeds.find((f) => f.id === feedId && f.userId === USER_ID);
  if (!feed) return null;
  return applyFeedToSpecies(feed, targetSpeciesId, discovered);
}

/** Species scheduled for each pyramid slot (fixed order per ecosystem). */
export function scheduledSpeciesForEco(ecosystem: Ecosystem): Species[] {
  return SPECIES.filter((s) => s.ecosystem === ecosystem);
}
