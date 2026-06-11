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

/** One captured individual on the pyramid (re-capture = new individual). */
export interface Individual {
  id: string;
  speciesId: string;
  userId: string;
  pw: number;
  createdAt: string;
  lastDecayAt: string;
}

/** Material from a capture — fed to the tier above. */
export interface FeedItem {
  id: string;
  userId: string;
  sourceSpeciesId: string;
  ecosystem: Ecosystem;
  trophicLevel: 1 | 2 | 3 | 4;
  pwValue: number;
  createdAt: string;
}

/** Logged-in user (public fields). */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

/** @deprecated Use UserProfile */
export type PlayerProfile = UserProfile & { playerId?: string };
export type AppUser = UserProfile;

/** Simple capture diary entry (PoC). */
export interface DiaryEntry {
  id: string;
  speciesId: string;
  userId: string;
  photoData?: string;
  observedAt: string;
}
