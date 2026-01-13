import { Flamework } from "@flamework/core";
import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import type { CharacterStats } from "shared/structs/data/character-stats";
import type { CharacterItem, WithCharacterStats, WithLevelRequirement, WithSchoolRequirement } from "shared/structs/data/items";
import type { GearData } from "shared/structs/data/items/gear";
import type { DeckData, DeckLinkedData, DeckReferenceData } from "shared/structs/data/items/gear/deck";
import type { PetData, PetLinkedData, PetReferenceData } from "shared/structs/data/items/gear/pet";
import type { GearReference } from "shared/structs/data/reference/gear";
import type { DeckReference } from "shared/structs/data/reference/gear/deck";
import type { PetReference } from "shared/structs/data/reference/gear/pet";

let gearReferenceCache = new Map<GearReference, GearData>();
export function getGearByReference(reference: GearReference): GearData {
  if (gearReferenceCache.has(reference))
    return gearReferenceCache.get(reference)!;

  const gear = getAllGear().find(data => data.reference === reference)!;
  gearReferenceCache.set(reference, gear);
  return gear;
}

let allGearsCache: Maybe<GearData[]>;
export function getAllGear(): GearData[] {
  if (allGearsCache !== undefined)
    return allGearsCache;

  const decksFolder = getInstanceAtPath("src/shared/game-data/items/gear")!;
  return allGearsCache = getDescendantsOfType(decksFolder, "ModuleScript").map(require<GearData>);
}

export function getPetByReferenceData({ reference, data }: PetReferenceData): PetData & PetLinkedData {
  const deckData = getPetByReference(reference);
  return {
    ...deckData,
    ...data
  };
}

let petReferenceCache = new Map<PetReference, PetData>();
export function getPetByReference(reference: PetReference): PetData {
  if (petReferenceCache.has(reference))
    return petReferenceCache.get(reference)!;

  const pet = getAllPets().find(data => data.reference === reference)!;
  petReferenceCache.set(reference, pet);
  return pet;
}

let allPetsCache: Maybe<PetData[]>;
export function getAllPets(): PetData[] {
  if (allPetsCache !== undefined)
    return allPetsCache;

  const decksFolder = getInstanceAtPath("src/shared/game-data/items/gear/pets")!;
  return allPetsCache = getDescendantsOfType(decksFolder, "ModuleScript").map(require<PetData>);
}

export function getDeckByReferenceData({ reference, data }: DeckReferenceData): DeckData & DeckLinkedData {
  const deckData = getDeckByReference(reference);
  return {
    ...deckData,
    ...data
  };
}

let deckReferenceCache = new Map<DeckReference, DeckData>();
export function getDeckByReference(reference: DeckReference): DeckData {
  if (deckReferenceCache.has(reference))
    return deckReferenceCache.get(reference)!;

  const deck = getAllDecks().find(data => data.reference === reference)!;
  deckReferenceCache.set(reference, deck);
  return deck;
}

let allDecksCache: Maybe<DeckData[]>;
export function getAllDecks(): DeckData[] {
  if (allDecksCache !== undefined)
    return allDecksCache;

  const decksFolder = getInstanceAtPath("src/shared/game-data/items/gear/decks")!;
  return allDecksCache = getDescendantsOfType(decksFolder, "ModuleScript").map(require<DeckData>);
}

export function hasLevelRequirement<T extends CharacterItem>(item: T): item is T & WithLevelRequirement {
  return "levelRequirement" in item && typeIs(item.levelRequirement, "number");
}

export function hasSchoolRequirement<T extends CharacterItem>(item: T): item is T & WithSchoolRequirement {
  return "schoolRequirement" in item && typeIs(item.schoolRequirement, "number");
}

const isCharacterStats = Flamework.createGuard<CharacterStats>();
export function hasStats<T extends CharacterItem>(item: T): item is T & WithCharacterStats {
  return "stats" in item && isCharacterStats(item.stats);
}