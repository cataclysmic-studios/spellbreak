import type GearCategories from "shared/data-models/gear-categories";
import type Gear from "shared/data-models/items/gear";
import { PlayableSchool } from "shared/data-models/school";

export const enum BadgeCategory {
  "Wizard Village" = "Wizard Village"
}

export interface CharacterData {
  readonly name: string;
  readonly school: PlayableSchool;
  readonly xp: number;
  readonly level: number;

  readonly gold: number;
  readonly arenaTickets: number;
  readonly trainingPoints: number;
  readonly equippedGear: GearCategories<Gear>;
  readonly backpack: GearCategories<Gear[]>;
}