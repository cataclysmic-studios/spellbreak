import type { f16, u8, u16, u32, u24, String } from "@rbxts/serio";

import type { School } from "../school";
import type { CharacterStats, PerSchoolStats } from "./character-stats";
import type { GearCategory } from "./items/gear";
import type { DeckLinkedData } from "./items/gear/deck";
import type { PetLinkedData } from "./items/gear/pet";
import type { BackpackData, CharacterData, EquippedGearData } from ".";

type QuestIDSchema = u16;
type SpellReferenceSchema = u16;
type GearReferenceSchema = u16;

type Primitive =
  | string
  | number
  | boolean
  | undefined;

type NonSymbolKeys<T> = Exclude<keyof T, symbol>;
type DeepPartial<T> =
  T extends Primitive
  ? T
  : T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
  ? { readonly [K in Exclude<keyof T, symbol>]?: DeepPartial<T[K]> }
  : T;

type DeepKeys<T> = {
  readonly [K in NonSymbolKeys<T>]?: true | (
    T[K] extends object ? DeepKeys<T[K]> : never
  );
};

export interface Diff<T> {
  readonly changed?: DeepPartial<T>;
  readonly removed?: DeepKeys<T>;
}

interface ReferenceWithDataSchema<T, R extends number = u16> {
  readonly reference: R;
  readonly data: T;
}

export type EquippedGearDataSchema = { [K in keyof EquippedGearData]: u8; };

export interface BackpackDataSchema extends BackpackData {
  readonly [GearCategory.Hat]: GearReferenceSchema[];
  readonly [GearCategory.Robe]: GearReferenceSchema[];
  readonly [GearCategory.Boots]: GearReferenceSchema[];
  readonly [GearCategory.Wand]: GearReferenceSchema[];
  readonly [GearCategory.Athame]: GearReferenceSchema[];
  readonly [GearCategory.Amulet]: GearReferenceSchema[];
  readonly [GearCategory.Ring]: GearReferenceSchema[];
  readonly [GearCategory.Pet]: ReferenceWithDataSchema<PetLinkedData>[];
  readonly [GearCategory.Mount]: GearReferenceSchema[];
  readonly [GearCategory.Deck]: ReferenceWithDataSchema<DeckLinkedData, GearReferenceSchema>[];
}

interface CharacterLocationSchema {
  readonly position: { x: f16; y: f16; z: f16 };
  readonly lookAlong: { x: f16; z: f16 };
}

export interface CharacterStatsSchema extends CharacterStats {
  readonly health: u16;
  readonly mana: u16;
  readonly energy: u16;
  readonly maxMana: u16;
  readonly maxHealth: u16;
  readonly maxEnergy: u16;
  readonly incomingHealing: u16;
  readonly outgoingHealing: u16;
  readonly powerPipChance: u8;
  readonly shadowPipRating: u8;
  readonly stunResistance: u8;
  readonly damage: PerSchoolStats<u16>;
  readonly resist: PerSchoolStats<u8>;
  readonly accuracy: PerSchoolStats<u8>;
  readonly criticalRating: PerSchoolStats<u16>;
  readonly criticalBlockRating: PerSchoolStats<u16>;
  readonly pierce: PerSchoolStats<u8>;
}

export interface CharacterDataSchema extends CharacterData {
  readonly name: String<u8>;
  readonly school: School;
  readonly level: u8;
  readonly xp: u32;
  readonly gold: u24;
  readonly trainingPoints: u8;
  readonly trainedSpells: SpellReferenceSchema[];
  readonly selectedQuest?: QuestIDSchema;
  readonly completedQuests: QuestIDSchema[];
  readonly activeQuests: Partial<Record<QuestIDSchema, u8>>; // quest id -> goal index
  /** Values represent index in backpack data */
  readonly equippedGear: EquippedGearDataSchema;
  readonly backpack: BackpackDataSchema;
  readonly stats: CharacterStatsSchema;
  readonly lastLocation: CharacterLocationSchema;
}

export interface PlayerDataSchema {
  readonly crowns: u32;
  readonly characters: CharacterDataSchema[];
}