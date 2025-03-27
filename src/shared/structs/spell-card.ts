import type { Spell } from "./spell";

export const enum SpellCardKind {
  Normal,
  Treasure,
  Item
}

export interface SpellCard {
  readonly kind: SpellCardKind;
  readonly spell: Spell;
}