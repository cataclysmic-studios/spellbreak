import type { GearCategory, GearData } from ".";
import type { ReferenceWithData } from "../../reference";
import type { DeckReference } from "../../reference/gear/deck";
import type { SpellReferenceData } from "shared/structs/spell";

export type DeckReferenceData = ReferenceWithData<DeckLinkedData, DeckReference>;

export interface DeckLinkedData {
  readonly spellReferences: SpellReferenceData[];
  readonly sideboardSpellReferences: SpellReferenceData[];
}

export interface DeckData extends GearData {
  readonly category: GearCategory.Deck;
  readonly reference: DeckReference;
  readonly maxSpells: number;
  readonly maxSideboardSpells: number;
  readonly maxCopies: number;
  readonly maxSchoolCopies: number;
}