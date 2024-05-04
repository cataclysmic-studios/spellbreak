import type { PlayableSchool } from "shared/data-models/school";
import type { ItemReference } from "./item-reference";
import type { GearCategory } from "./items/gear";
import type CharacterStats from "./character-stats";

export const enum BadgeCategory {
  WizardVillage = "Wizard Village"
}

export interface CharacterData {
  readonly id: string;
  readonly name: string;
  readonly school: PlayableSchool;
  xp: number;
  level: number;
  gold: number;
  arenaTickets: number;
  trainingPoints: number;
  stats: CharacterStats;

  readonly trainedSpells: string[];
  readonly equippedGear: Partial<Record<GearCategory, ItemReference>>;
  readonly backpack: ItemReference[];
  readonly housingItems: string[];
}