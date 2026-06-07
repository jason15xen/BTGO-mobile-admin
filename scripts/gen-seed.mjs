// Generates a bundled demo dataset for the user-app so the deployed (Vercel)
// build shows a fully-populated UI without any external/writable store.
// Output: user-app/src/data/seedObservations.json
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// (id, ecosystem, trophicLevel) — must match src/data/species.ts
const SPECIES = [
  ["t-hawk", "terrestrial", 4], ["t-fox", "terrestrial", 3], ["t-kingfisher", "terrestrial", 3],
  ["t-stagbeetle", "terrestrial", 2], ["t-monarch", "terrestrial", 2], ["t-bee", "terrestrial", 2],
  ["t-sakura", "terrestrial", 1], ["t-fern", "terrestrial", 1], ["t-bamboo", "terrestrial", 1], ["t-grass", "terrestrial", 1],
  ["f-otter", "freshwater", 4], ["f-heron", "freshwater", 3], ["f-trout", "freshwater", 3],
  ["f-crayfish", "freshwater", 2], ["f-frog", "freshwater", 2], ["f-daphnia", "freshwater", 2],
  ["f-lotus", "freshwater", 1], ["f-algae", "freshwater", 1], ["f-reed", "freshwater", 1], ["f-duckweed", "freshwater", 1],
  ["m-dolphin", "marine", 4], ["m-gull", "marine", 3], ["m-mackerel", "marine", 3],
  ["m-crab", "marine", 2], ["m-krill", "marine", 2], ["m-tuna", "marine", 2],
  ["m-seaweed", "marine", 1], ["m-plankton", "marine", 1], ["m-amamo", "marine", 1], ["m-aoasa", "marine", 1],
].map(([id, ecosystem, trophicLevel]) => ({ id, ecosystem, trophicLevel }));

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_TS = 1780228800000; // 2026-05-31T12:00:00Z

const HOTSPOTS = [
  { name: "河口湖", lat: 35.517, lng: 138.754, spread: 0.02, ecosystems: ["freshwater", "terrestrial"] },
  { name: "山中湖", lat: 35.418, lng: 138.872, spread: 0.02, ecosystems: ["freshwater", "terrestrial"] },
  { name: "白糸の滝", lat: 35.323, lng: 138.595, spread: 0.018, ecosystems: ["freshwater", "terrestrial"] },
  { name: "青木ヶ原樹海", lat: 35.47, lng: 138.62, spread: 0.025, ecosystems: ["terrestrial"] },
  { name: "富士山五合目", lat: 35.36, lng: 138.73, spread: 0.03, ecosystems: ["terrestrial"] },
  { name: "富士市街", lat: 35.161, lng: 138.676, spread: 0.02, ecosystems: ["terrestrial", "freshwater"] },
  { name: "田子の浦", lat: 35.13, lng: 138.7, spread: 0.025, ecosystems: ["marine"] },
  { name: "富士川河口", lat: 35.12, lng: 138.63, spread: 0.022, ecosystems: ["marine", "freshwater"] },
];

const USER_NAMES = ["さくら", "ヒロト", "ユウナ", "ケンジ", "アオイ", "ハルキ", "ミオ", "ソウタ",
  "リン", "ダイチ", "ナナミ", "タクミ", "エマ", "レン", "ヒナ", "カイト", "モモカ", "ショウ", "アカリ", "ユウキ"];

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const gaussianish = (rng) => (rng() + rng()) / 2 - 0.5;

const rng = mulberry32(20260601);
const byEco = {
  terrestrial: SPECIES.filter((s) => s.ecosystem === "terrestrial"),
  freshwater: SPECIES.filter((s) => s.ecosystem === "freshwater"),
  marine: SPECIES.filter((s) => s.ecosystem === "marine"),
};

const out = [];

// ---- Community observations (populate home health, today's finds, rare alert) ----
for (let i = 0; i < 380; i++) {
  const h = pick(rng, HOTSPOTS);
  const ecosystem = pick(rng, h.ecosystems);
  const pool = byEco[ecosystem];
  const weighted = pool.flatMap((s) => Array(5 - s.trophicLevel).fill(s));
  const sp = pick(rng, weighted);
  const lat = h.lat + gaussianish(rng) * h.spread * 2;
  const lng = h.lng + gaussianish(rng) * h.spread * 2;
  const dayOffset = Math.floor(rng() * 60);
  const r = rng();
  out.push({
    id: `obs-${i + 1}`,
    speciesId: sp.id,
    userId: `u-${Math.floor(rng() * 1000)}`,
    userName: pick(rng, USER_NAMES),
    lat: Number(lat.toFixed(5)),
    lng: Number(lng.toFixed(5)),
    area: h.name,
    observedAt: new Date(BASE_TS - dayOffset * 86400000).toISOString(),
    status: r > 0.92 ? "flagged" : r > 0.8 ? "pending" : "verified",
  });
}

// ---- Demo user ("あなた") — a rich, varied collection for the UI demo ----
// [speciesId, area, lat, lng, dayOffset, count]
const DEMO = [
  ["t-monarch", "白糸の滝", 35.323, 138.596, 0, 2],
  ["t-kingfisher", "河口湖", 35.518, 138.755, 0, 1],
  ["t-stagbeetle", "青木ヶ原樹海", 35.471, 138.621, 1, 3],
  ["t-fox", "富士山五合目", 35.361, 138.731, 2, 1],
  ["t-bee", "富士市街", 35.162, 138.677, 3, 4],
  ["t-grass", "山中湖", 35.419, 138.873, 4, 2],
  ["t-bamboo", "白糸の滝", 35.322, 138.594, 5, 2],
  ["t-sakura", "河口湖", 35.516, 138.753, 6, 1],
  ["t-fern", "青木ヶ原樹海", 35.469, 138.619, 8, 1],
  ["t-hawk", "富士山五合目", 35.359, 138.729, 10, 1],
  ["f-frog", "山中湖", 35.419, 138.871, 7, 3],
  ["f-trout", "白糸の滝", 35.322, 138.594, 9, 2],
  ["f-heron", "富士川河口", 35.121, 138.631, 11, 1],
  ["f-crayfish", "富士市街", 35.161, 138.675, 12, 2],
  ["f-lotus", "河口湖", 35.515, 138.752, 14, 1],
  ["f-otter", "白糸の滝", 35.324, 138.597, 16, 1],
  ["m-gull", "田子の浦", 35.131, 138.701, 13, 2],
  ["m-crab", "田子の浦", 35.129, 138.699, 15, 3],
  ["m-mackerel", "田子の浦", 35.132, 138.702, 18, 1],
  ["m-dolphin", "田子の浦", 35.128, 138.698, 20, 1],
];

let di = 0;
for (const [speciesId, area, lat, lng, dayOffset, count] of DEMO) {
  for (let c = 0; c < count; c++) {
    out.push({
      id: `obs-demo-${++di}`,
      speciesId,
      userId: "u-demo",
      userName: "あなた",
      lat: Number((lat + (rng() - 0.5) * 0.004).toFixed(5)),
      lng: Number((lng + (rng() - 0.5) * 0.004).toFixed(5)),
      area,
      observedAt: new Date(BASE_TS - (dayOffset + c) * 86400000).toISOString(),
      status: "verified",
    });
  }
}

out.sort((a, b) => (a.observedAt < b.observedAt ? 1 : -1));
writeFileSync(join(__dirname, "..", "src", "data", "seedObservations.json"), JSON.stringify(out));
console.log(`Wrote ${out.length} observations (demo species: ${DEMO.length}).`);
