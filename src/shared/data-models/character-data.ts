import type { PlayableSchool } from "shared/data-models/school";
import type { GearCategory } from "./items/gear";
import type CharacterStats from "./character-stats";
import { ItemReference } from "./item-reference";

export const enum BadgeCategory {
  WizardVillage = "Wizard Village"
}

export interface CharacterData {
  readonly id: string;
  readonly name: string;
  readonly school: PlayableSchool;
  readonly xp: number;
  readonly level: number;
  readonly gold: number;
  readonly arenaTickets: number;
  readonly trainingPoints: number;

  readonly stats: CharacterStats;
  readonly trainedSpells: string[];
  readonly equippedGear: Partial<Record<GearCategory, ItemReference>>;
  readonly backpack: ItemReference[];
  readonly housingItems: string[];
}