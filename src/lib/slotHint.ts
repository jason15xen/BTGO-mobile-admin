import type { IconType } from "react-icons";
import {
  GiBirdClaw,
  GiMammoth,
  GiSpottedBug,
  GiSchoolOfFish,
  GiPlantRoots,
  GiFrog,
  GiCrab,
  GiWaterDrop,
} from "react-icons/gi";
import { SPECIES_INFO } from "@/data/speciesInfo";
import type { Rarity, Species } from "@/lib/types";

type SlotHint = {
  Icon: IconType;
  categoryLabel: string;
  iconClass: string;
  bgClass: string;
  habitatCue: string;
  rarityLabel: string;
  rarityClass: string;
};

const BIRD_CATS = new Set(["猛禽類", "鳥類", "水鳥", "海鳥"]);
const MAMMAL_CATS = new Set(["哺乳類", "海生哺乳類"]);
const INSECT_CATS = new Set(["昆虫"]);
const FISH_CATS = new Set(["魚類", "大型魚類", "中小型魚類"]);
const PLANT_CATS = new Set([
  "顕花植物",
  "コケ・シダ",
  "水生植物",
  "海草",
  "海藻",
  "藻類",
  "植物プランクトン",
]);

const RARITY_STYLE: Record<Rarity, { label: string; className: string }> = {
  common: { label: "コモン", className: "text-neutral-400" },
  uncommon: { label: "アンコモン", className: "text-teal-600" },
  rare: { label: "レア", className: "text-amber-600" },
  legendary: { label: "レジェンド", className: "text-violet-600" },
};

function categoryGroup(category: string): Pick<SlotHint, "Icon" | "iconClass" | "bgClass"> {
  if (BIRD_CATS.has(category)) {
    return { Icon: GiBirdClaw, iconClass: "text-sky-600/80", bgClass: "from-sky-50 to-sky-100/80" };
  }
  if (MAMMAL_CATS.has(category)) {
    return { Icon: GiMammoth, iconClass: "text-amber-800/75", bgClass: "from-amber-50 to-orange-100/70" };
  }
  if (INSECT_CATS.has(category)) {
    return { Icon: GiSpottedBug, iconClass: "text-lime-700/80", bgClass: "from-lime-50 to-lime-100/80" };
  }
  if (FISH_CATS.has(category)) {
    return { Icon: GiSchoolOfFish, iconClass: "text-blue-600/80", bgClass: "from-blue-50 to-cyan-100/80" };
  }
  if (category === "両生類") {
    return { Icon: GiFrog, iconClass: "text-emerald-700/80", bgClass: "from-emerald-50 to-teal-100/80" };
  }
  if (category === "海生無脊椎動物" || category === "水生無脊椎動物") {
    return { Icon: GiCrab, iconClass: "text-rose-700/75", bgClass: "from-rose-50 to-orange-50/80" };
  }
  if (PLANT_CATS.has(category)) {
    return { Icon: GiPlantRoots, iconClass: "text-forest-700/80", bgClass: "from-forest-50 to-forest-100/80" };
  }
  return { Icon: GiWaterDrop, iconClass: "text-neutral-500/80", bgClass: "from-neutral-50 to-neutral-100" };
}

/** Short habitat cue — enough to guess, not the species name. */
export function habitatCue(speciesId: string): string {
  const habitat = SPECIES_INFO[speciesId]?.habitat;
  if (!habitat) return "野外";
  const first = habitat.split(/[・、]/)[0]?.trim() ?? habitat;
  return first.length > 8 ? `${first.slice(0, 7)}…` : first;
}

export function slotHintFor(species: Species): SlotHint {
  const group = categoryGroup(species.category);
  const rarity = RARITY_STYLE[species.rarity];
  return {
    ...group,
    categoryLabel: species.category,
    habitatCue: habitatCue(species.id),
    rarityLabel: rarity.label,
    rarityClass: rarity.className,
  };
}
