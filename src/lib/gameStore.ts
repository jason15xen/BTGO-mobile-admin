import "server-only";
import { randomUUID } from "node:crypto";
import { SPECIES, SPECIES_BY_ID } from "@/data/species";
import { applyDecay, captureFeedPw, INITIAL_PW } from "@/lib/creature";
import { validPredatorsForFeed, invasiveForEcosystem } from "@/lib/feedRules";
import { DEMO_USER } from "@/lib/game";
import type { Ecosystem, FeedItem, Individual, Species } from "@/lib/types";

const USER_ID = DEMO_USER.id;

let individuals: Individual[] = [];
let feeds: FeedItem[] = [];

function decayedIndividuals(): Individual[] {
  const now = Date.now();
  return individuals.map((ind) => {
    const { pw, lastDecayAt } = applyDecay(ind.pw, ind.lastDecayAt, now);
    return { ...ind, pw, lastDecayAt };
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

export function completeCapture(speciesId: string): {
  feed: FeedItem;
  pwValue: number;
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
  feeds.unshift(feed);
  upsertIndividual(speciesId, USER_ID);
  return { feed, pwValue };
}

function ensureIndividualsForDiscovered(discovered: string[]) {
  if (individuals.length > 0) return;
  const now = new Date().toISOString();
  individuals = discovered.map((speciesId) => ({
    id: randomUUID(),
    speciesId,
    userId: USER_ID,
    pw: INITIAL_PW,
    createdAt: now,
    lastDecayAt: now,
  }));
}

/** PoC demo: restore feed tray after server restart from discovered species. */
function ensureFeedsForDiscovered(discovered: string[]) {
  if (feeds.some((f) => f.userId === USER_ID)) return;
  const discoveredSet = new Set(discovered);
  const now = new Date().toISOString();
  for (const species of SPECIES) {
    if (!discoveredSet.has(species.id) || species.trophicLevel >= 4) continue;
    feeds.push({
      id: randomUUID(),
      userId: USER_ID,
      sourceSpeciesId: species.id,
      ecosystem: species.ecosystem,
      trophicLevel: species.trophicLevel,
      pwValue: captureFeedPw(species),
      createdAt: now,
    });
    if (feeds.filter((f) => f.userId === USER_ID).length >= 8) break;
  }
}

export function getGameState(discovered: string[]) {
  ensureIndividualsForDiscovered(discovered);
  ensureFeedsForDiscovered(discovered);
  const list = decayedIndividuals().filter((i) => i.userId === USER_ID);
  persistIndividuals(list);

  const discoveredSet = new Set(discovered);
  const pwMap = latestPwBySpecies(list);
  const activeIds = activeSpeciesIds(list);

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
    pwMap,
    activeIds: [...activeIds],
    invasive,
  };
}

function applyFeedToSpecies(
  feed: FeedItem,
  targetSpeciesId: string,
  discovered: Set<string>,
):
  | { predatorName: string; gained: number; newPw: number }
  | "no-predator"
  | "invalid-target" {
  const predators = validPredatorsForFeed(feed, discovered);
  if (predators.length === 0) return "no-predator";
  if (!predators.some((p) => p.id === targetSpeciesId)) return "invalid-target";

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

  const gained = feed.pwValue;
  const newPw = target.pw + gained;
  persistIndividuals(
    list.map((i) => (i.id === target!.id ? { ...i, pw: newPw } : i)),
  );
  feeds = feeds.filter((f) => f.id !== feed.id);

  const predator = SPECIES_BY_ID[target.speciesId];
  return {
    predatorName: predator?.nameJa ?? "生き物",
    gained,
    newPw,
  };
}

export function feedToTarget(
  feedId: string,
  targetSpeciesId: string,
  discovered: Set<string>,
):
  | { predatorName: string; gained: number; newPw: number }
  | "no-predator"
  | "invalid-target"
  | null {
  const feed = feeds.find((f) => f.id === feedId && f.userId === USER_ID);
  if (!feed) return null;
  return applyFeedToSpecies(feed, targetSpeciesId, discovered);
}

/** Species scheduled for each pyramid slot (fixed order per ecosystem). */
export function scheduledSpeciesForEco(ecosystem: Ecosystem): Species[] {
  return SPECIES.filter((s) => s.ecosystem === ecosystem);
}
