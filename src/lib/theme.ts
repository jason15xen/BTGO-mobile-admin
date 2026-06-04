import type { IconType } from "react-icons";
import { LuTrees, LuDroplet, LuWaves } from "react-icons/lu";
import type { Ecosystem, Rarity } from "./types";

// Per-ecosystem accents — emerald / teal / lime for a rich but cohesive look.
export const ECO_THEME: Record<
  Ecosystem,
  { name: string; Icon: IconType; gradient: string; chip: string; text: string; ring: string; solid: string }
> = {
  terrestrial: {
    name: "陸域",
    Icon: LuTrees,
    gradient: "from-forest-500 to-forest-700",
    chip: "bg-forest-100 text-forest-700",
    text: "text-forest-600",
    ring: "ring-forest-400",
    solid: "bg-forest-600",
  },
  freshwater: {
    name: "淡水域",
    Icon: LuDroplet,
    gradient: "from-teal-500 to-teal-700",
    chip: "bg-teal-100 text-teal-700",
    text: "text-teal-600",
    ring: "ring-teal-400",
    solid: "bg-teal-600",
  },
  marine: {
    name: "海域",
    Icon: LuWaves,
    gradient: "from-lime-500 to-teal-600",
    chip: "bg-lime-100 text-lime-600",
    text: "text-lime-600",
    ring: "ring-lime-400",
    solid: "bg-lime-600",
  },
};

export const RARITY_THEME: Record<Rarity, { label: string; chip: string; glow: string }> = {
  common: { label: "コモン", chip: "bg-neutral-100 text-neutral-500", glow: "" },
  uncommon: { label: "アンコモン", chip: "bg-forest-100 text-forest-700", glow: "" },
  rare: { label: "レア", chip: "bg-teal-500 text-white", glow: "shadow-[0_0_18px_rgba(20,184,166,0.5)]" },
  legendary: { label: "レジェンド", chip: "bg-gradient-to-r from-gold-400 to-gold-600 text-white", glow: "shadow-[0_0_20px_rgba(245,158,11,0.45)]" },
};
