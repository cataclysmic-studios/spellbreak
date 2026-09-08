import type { GearCategory, GearData } from ".";
import type { ReferenceWithData } from "../../reference";
import type { DeckReference } from "../../reference/gear/deck";
import type { SpellReference } from "../../reference/spell";

export type DeckReferenceData = ReferenceWithData<DeckLinkedData, DeckReference>;

export interface DeckLinkedData {
  readonly mainSpellReferences: SpellReference[];
  readonly itemCardSpellReferences: SpellReference[];
  readonly sideboardSpellReferences: SpellReference[];
}

export interface DeckData extends GearData {
  readonly category: GearCategory.Deck;
  readonly reference: DeckReference;
  readonly maxSpells: number;
  readonly maxSideboardSpells: number;
  readonly maxCopies: number;
  readonly maxSchoolCopies: number;
}