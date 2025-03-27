import type { School } from "../school";
import type { CharacterStats } from "./character-stats";
import type { GearCategory } from "./items/gear";
import type { DeckReferenceData } from "./items/gear/deck";
import type { PetReferenceData } from "./items/gear/pet";
import type { GearReference } from "./reference/gear";
import type { SpellReference } from "./reference/spell";

export interface EquippedGearData {
  readonly [GearCategory.Hat]?: number;
  readonly [GearCategory.Robe]?: number;
  readonly [GearCategory.Boots]?: number;
  readonly [GearCategory.Wand]?: number;
  readonly [GearCategory.Athame]?: number;
  readonly [GearCategory.Amulet]?: number;
  readonly [GearCategory.Ring]?: number;
  readonly [GearCategory.Pet]?: number;
  readonly [GearCategory.Mount]?: number;
  readonly [GearCategory.Deck]?: number;
}

export interface BackpackData {
  readonly [GearCategory.Hat]: GearReference[];
  readonly [GearCategory.Robe]: GearReference[];
  readonly [GearCategory.Boots]: GearReference[];
  readonly [GearCategory.Wand]: GearReference[];
  readonly [GearCategory.Athame]: GearReference[];
  readonly [GearCategory.Amulet]: GearReference[];
  readonly [GearCategory.Ring]: GearReference[];
  readonly [GearCategory.Pet]: PetReferenceData[];
  readonly [GearCategory.Mount]: GearReference[];
  readonly [GearCategory.Deck]: DeckReferenceData[];
}

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CharacterData {
  readonly name: string;
  readonly school: School;
  readonly level: number;
  readonly xp: number;
  readonly gold: number;
  readonly trainingPoints: number;
  readonly trainedSpells: SpellReference[];
  /** Values represent index in backpack data */
  readonly equippedGear: EquippedGearData;
  readonly backpack: BackpackData;
  readonly stats: CharacterStats;
  readonly lastLocation: {
    position: Vec3;
    lookAlong: Vec3;
  };
}

export interface PlayerData {
  readonly crowns: number;
  readonly characters: CharacterData[];
}