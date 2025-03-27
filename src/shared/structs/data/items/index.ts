import type { CharacterStats } from "../character-stats";
import type { School } from "../../school";

export interface CharacterItem {
  readonly name: string;
  readonly noAuction: boolean;
  readonly noTrade: boolean;
  readonly pvpOnly: boolean;
  readonly noPvp: boolean;
}

export interface WithLevelRequirement {
  readonly levelRequirement: number;
}

export interface WithSchoolRequirement {
  readonly schoolRequirement: School;
}

export interface WithCharacterStats {
  readonly stats: Partial<CharacterStats>;
}