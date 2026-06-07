import type { Species } from "@/lib/types";

// Pyramid layout: 1 + 2 + 3 + 4 = 10 slots per ecosystem.
export const PYRAMID_SLOTS: Record<1 | 2 | 3 | 4, number> = { 4: 1, 3: 2, 2: 3, 1: 4 };
export const PYRAMID_TOTAL = 10;

// Species catalog for the Mt. Fuji region PoC demo.
// Each ecosystem has exactly 10 species across trophic levels 1–4.
export const SPECIES: Species[] = [
  // ---------------- Terrestrial (10) ----------------
  { id: "t-hawk", nameJa: "クマタカ", nameSci: "Nisaetus nipalensis", ecosystem: "terrestrial", category: "猛禽類", trophicLevel: 4, rarity: "legendary", invasive: false, emoji: "🦅" },
  { id: "t-fox", nameJa: "キツネ", nameSci: "Vulpes vulpes", ecosystem: "terrestrial", category: "哺乳類", trophicLevel: 3, rarity: "uncommon", invasive: false, emoji: "🦊" },
  { id: "t-kingfisher", nameJa: "カワセミ", nameSci: "Alcedo atthis", ecosystem: "terrestrial", category: "鳥類", trophicLevel: 3, rarity: "rare", invasive: false, emoji: "🐦" },
  { id: "t-stagbeetle", nameJa: "ノコギリクワガタ", nameSci: "Prosopocoilus inclinatus", ecosystem: "terrestrial", category: "昆虫", trophicLevel: 2, rarity: "uncommon", invasive: false, emoji: "🪲" },
  { id: "t-monarch", nameJa: "オオカバマダラ", nameSci: "Danaus plexippus", ecosystem: "terrestrial", category: "昆虫", trophicLevel: 2, rarity: "rare", invasive: false, emoji: "🦋" },
  { id: "t-bee", nameJa: "ニホンミツバチ", nameSci: "Apis cerana japonica", ecosystem: "terrestrial", category: "昆虫", trophicLevel: 2, rarity: "common", invasive: false, emoji: "🐝" },
  { id: "t-sakura", nameJa: "ヤマザクラ", nameSci: "Cerasus jamasakura", ecosystem: "terrestrial", category: "顕花植物", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌸" },
  { id: "t-fern", nameJa: "シダ", nameSci: "Pteridium aquilinum", ecosystem: "terrestrial", category: "コケ・シダ", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌿" },
  { id: "t-bamboo", nameJa: "モウソウチク", nameSci: "Phyllostachys edulis", ecosystem: "terrestrial", category: "顕花植物", trophicLevel: 1, rarity: "common", invasive: true, emoji: "🎋" },
  { id: "t-grass", nameJa: "ススキ", nameSci: "Miscanthus sinensis", ecosystem: "terrestrial", category: "顕花植物", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌾" },

  // ---------------- Freshwater (10) ----------------
  { id: "f-otter", nameJa: "カワウソ", nameSci: "Lutra lutra", ecosystem: "freshwater", category: "哺乳類", trophicLevel: 4, rarity: "legendary", invasive: false, emoji: "🦦" },
  { id: "f-heron", nameJa: "アオサギ", nameSci: "Ardea cinerea", ecosystem: "freshwater", category: "水鳥", trophicLevel: 3, rarity: "common", invasive: false, emoji: "🐦‍⬛" },
  { id: "f-trout", nameJa: "ヤマメ", nameSci: "Oncorhynchus masou", ecosystem: "freshwater", category: "魚類", trophicLevel: 3, rarity: "uncommon", invasive: false, emoji: "🐟" },
  { id: "f-crayfish", nameJa: "アメリカザリガニ", nameSci: "Procambarus clarkii", ecosystem: "freshwater", category: "水生無脊椎動物", trophicLevel: 2, rarity: "common", invasive: true, emoji: "🦞" },
  { id: "f-frog", nameJa: "トノサマガエル", nameSci: "Pelophylax nigromaculatus", ecosystem: "freshwater", category: "両生類", trophicLevel: 2, rarity: "common", invasive: false, emoji: "🐸" },
  { id: "f-daphnia", nameJa: "ミジンコ", nameSci: "Daphnia pulex", ecosystem: "freshwater", category: "水生無脊椎動物", trophicLevel: 2, rarity: "common", invasive: false, emoji: "🦠" },
  { id: "f-lotus", nameJa: "ハス", nameSci: "Nelumbo nucifera", ecosystem: "freshwater", category: "水生植物", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🪷" },
  { id: "f-algae", nameJa: "アオミドロ", nameSci: "Spirogyra", ecosystem: "freshwater", category: "藻類", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🟢" },
  { id: "f-reed", nameJa: "ヨシ", nameSci: "Phragmites australis", ecosystem: "freshwater", category: "水生植物", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌾" },
  { id: "f-duckweed", nameJa: "ウキクサ", nameSci: "Spirodela polyrhiza", ecosystem: "freshwater", category: "水生植物", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🍃" },

  // ---------------- Marine (10) ----------------
  { id: "m-dolphin", nameJa: "ハンドウイルカ", nameSci: "Tursiops truncatus", ecosystem: "marine", category: "海生哺乳類", trophicLevel: 4, rarity: "legendary", invasive: false, emoji: "🐬" },
  { id: "m-gull", nameJa: "ウミネコ", nameSci: "Larus crassirostris", ecosystem: "marine", category: "海鳥", trophicLevel: 3, rarity: "common", invasive: false, emoji: "🕊️" },
  { id: "m-mackerel", nameJa: "マアジ", nameSci: "Trachurus japonicus", ecosystem: "marine", category: "中小型魚類", trophicLevel: 3, rarity: "common", invasive: false, emoji: "🐡" },
  { id: "m-crab", nameJa: "イソガニ", nameSci: "Hemigrapsus sanguineus", ecosystem: "marine", category: "海生無脊椎動物", trophicLevel: 2, rarity: "common", invasive: false, emoji: "🦀" },
  { id: "m-krill", nameJa: "オキアミ", nameSci: "Euphausia pacifica", ecosystem: "marine", category: "海生無脊椎動物", trophicLevel: 2, rarity: "common", invasive: false, emoji: "🦐" },
  { id: "m-tuna", nameJa: "クロマグロ", nameSci: "Thunnus orientalis", ecosystem: "marine", category: "大型魚類", trophicLevel: 2, rarity: "rare", invasive: false, emoji: "🐟" },
  { id: "m-seaweed", nameJa: "コンブ", nameSci: "Saccharina japonica", ecosystem: "marine", category: "海藻", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌾" },
  { id: "m-plankton", nameJa: "植物プランクトン", nameSci: "Phytoplankton", ecosystem: "marine", category: "植物プランクトン", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🦠" },
  { id: "m-amamo", nameJa: "アマモ", nameSci: "Zostera marina", ecosystem: "marine", category: "海草", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🌿" },
  { id: "m-aoasa", nameJa: "アオサ", nameSci: "Ulva pertusa", ecosystem: "marine", category: "海藻", trophicLevel: 1, rarity: "common", invasive: false, emoji: "🟢" },
];

export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(
  SPECIES.map((s) => [s.id, s])
);

export const ECOSYSTEM_LABEL: Record<string, string> = {
  terrestrial: "陸域",
  freshwater: "淡水域",
  marine: "海域",
};

export const RARITY_LABEL: Record<string, string> = {
  common: "コモン",
  uncommon: "アンコモン",
  rare: "レア",
  legendary: "レジェンド",
};
