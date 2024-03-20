import type { PlayableSchool } from "shared/data-models/school";
import type { GearCategory, Gear } from "./items/gear";
import type { Housing } from "./items/housing";
import type CharacterStats from "./character-stats";

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
  readonly equippedGear: Partial<Record<GearCategory, Gear>>;
  readonly backpack: Gear[];
  readonly housingItems: Housing[];
}