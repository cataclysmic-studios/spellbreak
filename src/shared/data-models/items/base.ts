import type { School } from "../school";
import type CharacterStats from "../character-stats";

export interface CharacterItem {
  readonly name: string;
  readonly noAuction: boolean;
  readonly noTrade: boolean;
  readonly pvpOnly: boolean;
  readonly noPvp: boolean;
}

export interface WithRequirements {
  readonly levelRequirement: Maybe<number>;
  readonly schoolRequirement: Maybe<School>;
}

export interface WithCharacterStats {
  readonly stats: CharacterStats;
}