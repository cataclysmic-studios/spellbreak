import { getDeckByReferenceData, getPetByReferenceData, getGearByReference } from "./items";
import { type GearData, GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData, Diff } from "shared/structs/data";
import type { DeckReferenceData } from "shared/structs/data/items/gear/deck";
import type { PetReferenceData } from "shared/structs/data/items/gear/pet";
import type { GearReference } from "shared/structs/data/reference/gear";

type GenericRecord = Record<string, unknown>;

export function createDiff<T>(oldData: T, newData: T): Diff<T> {
  if (oldData === newData)
    return {};

  assert(typeIs(oldData, "table"), "attempt to create diff of non-table objects");
  assert(typeIs(newData, "table"), "attempt to create diff of non-table objects");

  let changed: Diff<T>["changed"];
  let removed: Diff<T>["removed"];
  for (const [key] of pairs(oldData)) {
    if (newData[key] !== undefined) continue;

    removed ??= {};
    (removed as GenericRecord)[key] = true;
  }

  for (const [key, newValue] of pairs(newData)) {
    const oldValue = oldData[key];
    if (oldValue === undefined) {
      changed ??= {};
      (changed as GenericRecord)[key] = newValue;
      continue;
    }

    if (!typeIs(oldValue, "table") || !typeIs(newValue, "table")) {
      changed ??= {};
      (changed as GenericRecord)[key] = newValue;
      continue;
    }

    const childDiff = createDiff(oldValue, newValue);
    if ("changed" in childDiff) {
      changed ??= {};
      (changed as GenericRecord)[key] = childDiff.changed ?? newValue;
    }
    if ("removed" in childDiff) {
      removed ??= {};
      (removed as GenericRecord)[key] = childDiff.removed;
    }
  }

  return { changed, removed };
}

export function applyPatch<T extends object>(base: T, diff: Diff<T>): T {
  const result = {} as T;
  for (const [key, value] of pairs(base))
    result[key as never] = value;

  if (diff.removed)
    for (const [key] of pairs(diff.removed))
      result[key as never] = undefined!;

  if (diff.changed)
    for (const [key, value] of pairs(diff.changed)) {
      const baseValue = base[key as never];
      if (typeIs(value, "table") && typeIs(baseValue, "table"))
        result[key as never] = applyPatch(baseValue, {
          changed: value as never,
          removed: diff.removed && diff.removed[key as never]
        });
      else
        result[key as never] = value as never;
    }

  return result;
}

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