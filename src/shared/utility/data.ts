import { getDeckByReferenceData, getPetByReferenceData, getGearByReference } from "./items";
import { type GearData, GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData } from "shared/structs/data";
import type { DeckReferenceData } from "shared/structs/data/items/gear/deck";
import type { PetReferenceData } from "shared/structs/data/items/gear/pet";
import type { GearReference } from "shared/structs/data/reference/gear";

export function getEquippedGear<T extends GearData = GearData>(category: GearCategory, characterData: CharacterData): Maybe<T> {
  const indexInBackpack = characterData.equippedGear[category];
  if (indexInBackpack === undefined) return;

  const reference = characterData.backpack[category][indexInBackpack];
  if (category === GearCategory.Deck)
    return getDeckByReferenceData(reference as DeckReferenceData) as unknown as T;
  else if (category === GearCategory.Pet)
    return getPetByReferenceData(reference as PetReferenceData) as T;

  return getGearByReference(reference as GearReference) as T;
}