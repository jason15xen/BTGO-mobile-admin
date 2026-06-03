// Core domain types — kept in sync with the admin project.

export type Ecosystem = "terrestrial" | "freshwater" | "marine";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export interface Species {
  id: string;
  nameJa: string;
  nameSci: string;
  ecosystem: Ecosystem;
  category: string;
  trophicLevel: 1 | 2 | 3 | 4;
  rarity: Rarity;
  invasive: boolean;
  emoji: string;
}

export interface Observation {
  id: string;
  speciesId: string;
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  area: string;
  observedAt: string;
  status: "verified" | "pending" | "flagged";
}
