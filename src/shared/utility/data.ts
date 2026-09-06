import type { Modding } from "@flamework/core";
import Sift from "@rbxts/sift";

import { getDeckByReferenceData, getPetByReferenceData, getGearByReference } from "./items";
import { type GearData, GearCategory } from "shared/structs/data/items/gear";
import type { CharacterData, PlayerData } from "shared/structs/data";
import type { DeckReferenceData } from "shared/structs/data/items/gear/deck";
import type { PetReferenceData } from "shared/structs/data/items/gear/pet";
import type { GearReference } from "shared/structs/data/reference/gear";
import type { Diff } from "shared/structs/data/serialization";
import Log from "shared/log";

type NumericKey =
  | number
  | `${number}`;

type NumericKeys<T> = Extract<keyof T, NumericKey>;
type NumericRecordGuard<T extends {}> = Modding.Generic<{ [K in keyof T as K extends NumericKeys<T> ? K : never]: T[K] }, "guard">;

/** @metadata macro */
export function fixNumericKeys<T extends {}>(data: T, guard?: NumericRecordGuard<T>): T {
  Log.assert(guard !== undefined);
  if (!guard(data))
    return data;

  const result = {} as T;
  for (const [key, value] of pairs(data)) {
    const newValue = fixNumericKeys(value, ((v: unknown) => typeIs(v, "table")) as never);
    if (typeIs(key, "string") && tonumber(key) !== undefined) {
      result[tonumber(key) as never] = newValue;
      continue;
    }

    result[key] = newValue;
  }

  return result;
}

export function updateCharacter(data: PlayerData, index: number, newCharacter: CharacterData): PlayerData {
  return Sift.Dictionary.merge(data, {
    characters: Sift.Array.set(data.characters, index, newCharacter)
  });
}

type GenericRecord = Record<string, unknown>;

/** A table is treated as an array/numeric-keyed dictionary if its first key (if any) is a number. */
function isNumericKeyed(value: object): boolean {
  for (const [key] of pairs(value))
    return typeIs(key, "number");

  return false;
}

function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!typeIs(a, "table") || !typeIs(b, "table")) return false;

  for (const [key, value] of pairs(a as GenericRecord))
    if (!deepEquals(value, (b as GenericRecord)[key])) return false;

  for (const [key] of pairs(b as GenericRecord))
    if ((a as GenericRecord)[key] === undefined) return false;

  return true;
}

export function createDiff<T>(oldData: T, newData: T): Diff<T> {
  if (oldData === newData)
    return {};

  Log.assert(typeIs(oldData, "table"), "attempt to create diff of non-table objects");
  Log.assert(typeIs(newData, "table"), "attempt to create diff of non-table objects");

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
      changed ??= {} as never;
      (changed as GenericRecord)[key] = newValue;
      continue;
    }

    if ((!typeIs(oldValue, "table") || !typeIs(newValue, "table")) && oldValue !== newValue) {
      changed ??= {} as never;
      (changed as GenericRecord)[key] = newValue;
      continue;
    }

    // Arrays and other numeric-keyed tables can't be diffed key-by-key: a partial result either
    // isn't a contiguous array anymore (the wire format rejects it) or silently drops entries
    // whose index didn't change. Replace the whole value instead whenever it actually differs.
    if (typeIs(oldValue, "table") && typeIs(newValue, "table") && (isNumericKeyed(oldValue) || isNumericKeyed(newValue))) {
      if (deepEquals(oldValue, newValue)) continue;

      changed ??= {} as never;
      (changed as GenericRecord)[key] = newValue;

      let removedKeys: GenericRecord | undefined;
      for (const [k] of pairs(oldValue as GenericRecord)) {
        if ((newValue as GenericRecord)[k] !== undefined) continue;
        removedKeys ??= {};
        removedKeys[k] = true;
      }

      if (removedKeys !== undefined) {
        removed ??= {};
        (removed as GenericRecord)[key] = removedKeys;
      }

      continue;
    }

    const childDiff = createDiff(oldValue, newValue);
    if ("changed" in childDiff) {
      changed ??= {} as never;
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
    for (const [key, value] of pairs(diff.removed))
      if (value === true)
        result[key as never] = undefined!;
      else
        result[key as never] = applyPatch(base[key as never], {
          changed: diff.changed?.[key as never],
          removed: diff.removed?.[key as never]
        });

  if (diff.changed)
    for (const [key, value] of pairs(diff.changed)) {
      const baseValue = base[key as never];
      if (typeIs(value, "table") && typeIs(baseValue, "table"))
        result[key as never] = applyPatch(baseValue, {
          changed: value as never,
          removed: diff.removed?.[key as never]
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