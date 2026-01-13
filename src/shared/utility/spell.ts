import { getInstanceAtPath } from "@rbxts/flamework-meta-utils";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import type { Spell, SpellReferenceData } from "shared/structs/spell";
import type { SpellReference } from "shared/structs/data/reference/spell";
import type { SpellCard } from "shared/structs/spell-card";

export function getSpellCardFromReferenceData({ reference, data }: SpellReferenceData): SpellCard {
  const spell = getSpellFromReference(reference);
  return {
    kind: data.spellCardKind,
    spell
  };
}

const cachedSpells: Partial<Record<SpellReference, Spell>> = {};
export function getSpellFromReference(reference: SpellReference): Spell {
  if (cachedSpells[reference] !== undefined)
    return cachedSpells[reference];

  return cachedSpells[reference] = getAllSpells().find(spell => spell.reference === reference)!;
}

let allSpellsCache: Maybe<Spell[]>;
export function getAllSpells(): Spell[] {
  if (allSpellsCache !== undefined)
    return allSpellsCache;

  const spellsFolder = getInstanceAtPath("src/shared/game-data/spells")!;
  return allSpellsCache = getDescendantsOfType(spellsFolder, "ModuleScript").mapFiltered(require<Spell>);
}