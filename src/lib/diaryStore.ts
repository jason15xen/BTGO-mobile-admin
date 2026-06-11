import "server-only";

// User-added annotations (note / emotion), keyed by observation id.
type Annotation = { note?: string; emotion?: string };
const annotations: Record<string, Annotation> = {};

export function getAnnotation(id: string): Annotation {
  return annotations[id] ?? {};
}

export function setAnnotation(id: string, patch: Annotation): Annotation {
  annotations[id] = { ...annotations[id], ...patch };
  return annotations[id];
}

// Deterministic "weather" so each entry has a stable, plausible value.
const WEATHERS = ["☀️ 晴れ", "🌤 晴れ時々くもり", "☁️ くもり", "🌧 小雨"];
export function weatherFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return WEATHERS[h % WEATHERS.length];
}
