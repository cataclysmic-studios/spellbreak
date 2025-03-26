import type { Spell } from "./spell";

export const enum CardKind {
  Normal,
  Treasure,
  Item
}

export interface SpellCard {
  readonly cardKind: CardKind;
  readonly spell: Spell;
}