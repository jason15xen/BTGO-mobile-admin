"use client";

import { SPECIES, SPECIES_BY_ID } from "@/data/species";
import { applyDecay, INITIAL_PW, rollFeedPw } from "@/lib/creature";
import type { DiaryEntry, FeedItem, Individual } from "@/lib/types";

const INDIVIDUALS_KEY = "btgo_individuals";
const FEEDS_KEY = "btgo_feeds";
const DIARY_KEY = "btgo_diary";

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota — PoC best effort */
  }
}

function withDecay(individuals: Individual[]): Individual[] {
  const now = Date.now();
  let changed = false;
  const next = individuals.map((ind) => {
    const { pw, lastDecayAt } = applyDecay(ind.pw, ind.lastDecayAt, now);
    if (pw !== ind.pw || lastDecayAt !== ind.lastDecayAt) changed = true;
    return pw === ind.pw && lastDecayAt === ind.lastDecayAt ? ind : { ...ind, pw, lastDecayAt };
  });
  if (changed) writeJson(INDIVIDUALS_KEY, next);
  return next;
}

export function loadIndividuals(userId: string): Individual[] {
  return withDecay(readJson<Individual>(INDIVIDUALS_KEY).filter((i) => i.userId === userId));
}

export function loadUserFeeds(userId: string): FeedItem[] {
  return readJson<FeedItem>(FEEDS_KEY).filter((f) => f.userId === userId);
}

export function loadDiary(userId: string): DiaryEntry[] {
  return readJson<DiaryEntry>(DIARY_KEY)
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.observedAt.localeCompare(a.observedAt));
}

/** Latest pw per species for pyramid display. */
export function pwBySpecies(userId: string): Record<string, number> {
  const latest: Record<string, { pw: number; at: string }> = {};
  for (const ind of loadIndividuals(userId)) {
    const cur = latest[ind.speciesId];
    if (!cur || ind.createdAt > cur.at) latest[ind.speciesId] = { pw: ind.pw, at: ind.createdAt };
  }
  return Object.fromEntries(Object.entries(latest).map(([id, v]) => [id, v.pw]));
}

export function createIndividual(userId: string, speciesId: string): Individual {
  const now = new Date().toISOString();
  const ind: Individual = {
    id: `ind-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    speciesId,
    userId,
    pw: INITIAL_PW,
    createdAt: now,
    lastDecayAt: now,
  };
  const all = readJson<Individual>(INDIVIDUALS_KEY);
  all.unshift(ind);
  writeJson(INDIVIDUALS_KEY, all);
  return ind;
}

export function grantFeed(userId: string, sourceSpeciesId: string): FeedItem {
  const sp = SPECIES_BY_ID[sourceSpeciesId];
  const feed: FeedItem = {
    id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    sourceSpeciesId,
    ecosystem: sp?.ecosystem ?? "terrestrial",
    trophicLevel: sp?.trophicLevel ?? 1,
    pwValue: rollFeedPw(),
    createdAt: new Date().toISOString(),
  };
  const all = readJson<FeedItem>(FEEDS_KEY);
  all.unshift(feed);
  writeJson(FEEDS_KEY, all);
  return feed;
}

export function addDiaryEntry(entry: DiaryEntry) {
  const all = readJson<DiaryEntry>(DIARY_KEY);
  all.unshift(entry);
  writeJson(DIARY_KEY, all);
}

/** Tap feed → tap predator one tier above. */
export function applyPredation(
  userId: string,
  feedId: string,
  predatorSpeciesId: string,
): { gained: number; newPw: number } | null {
  const feeds = readJson<FeedItem>(FEEDS_KEY);
  const feedIdx = feeds.findIndex((f) => f.id === feedId && f.userId === userId);
  if (feedIdx < 0) return null;

  const feed = feeds[feedIdx];
  const predator = SPECIES_BY_ID[predatorSpeciesId];
  if (!predator || predator.ecosystem !== feed.ecosystem) return null;
  if (predator.trophicLevel !== feed.trophicLevel + 1) return null;

  const individuals = withDecay(readJson<Individual>(INDIVIDUALS_KEY));
  const targetIdx = individuals.findIndex(
    (i) => i.userId === userId && i.speciesId === predatorSpeciesId,
  );
  if (targetIdx < 0) return null;

  const target = individuals[targetIdx];
  const newPw = target.pw + feed.pwValue;
  individuals[targetIdx] = { ...target, pw: newPw };
  feeds.splice(feedIdx, 1);

  writeJson(INDIVIDUALS_KEY, individuals);
  writeJson(FEEDS_KEY, feeds);
  return { gained: feed.pwValue, newPw };
}

/** Ensure discovered species have an individual (seed / returning users). */
export function bootstrapIndividuals(userId: string, speciesIds: string[]) {
  const existing = new Set(loadIndividuals(userId).map((i) => i.speciesId));
  for (const id of speciesIds) {
    if (!existing.has(id)) createIndividual(userId, id);
  }
}

/** Valid predators one trophic level above this feed (discovered only). */
export function validPredatorsForFeed(feed: FeedItem, discovered: Set<string>) {
  return SPECIES.filter(
    (s) =>
      s.ecosystem === feed.ecosystem &&
      s.trophicLevel === feed.trophicLevel + 1 &&
      discovered.has(s.id),
  );
}

/** PoC: one tap on feed — auto-feed the weakest predator at the tier above. */
export function feedOneClick(
  userId: string,
  feedId: string,
  discovered: Set<string>,
  pwMap: Record<string, number>,
): { predatorName: string; gained: number; newPw: number } | "no-predator" | null {
  const feeds = readJson<FeedItem>(FEEDS_KEY);
  const feed = feeds.find((f) => f.id === feedId && f.userId === userId);
  if (!feed) return null;

  const predators = validPredatorsForFeed(feed, discovered);
  if (predators.length === 0) return "no-predator";

  const target = predators.reduce((best, s) => {
    const pw = pwMap[s.id] ?? INITIAL_PW;
    const bestPw = pwMap[best.id] ?? INITIAL_PW;
    return pw < bestPw ? s : best;
  });

  const result = applyPredation(userId, feedId, target.id);
  if (!result) return null;
  return { predatorName: target.nameJa, ...result };
}

export function hasInvasiveDiscovered(userId: string, ecosystem: string): boolean {
  const speciesIds = new Set(loadIndividuals(userId).map((i) => i.speciesId));
  return [...speciesIds].some((id) => {
    const sp = SPECIES_BY_ID[id];
    return sp?.invasive && sp.ecosystem === ecosystem;
  });
}
