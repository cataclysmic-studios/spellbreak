import type { School } from "./school";
import type { SpellAction } from "./spell-actions";

interface SpellCost {
  readonly pips: number | "X";
  readonly shadowPips?: number;
}

export const enum SpellType {
  Damage,
  AOE,
  Drain,
  Heal,
  Charm,
  Curse,
  Trap,
  Jinx,
  Ward,
  Aura,
  Global,
  Enchantment,
  Manipulation,
  Polymorph,
  Mutate
}

export interface Spell<T extends SpellType = SpellType> {
  readonly type: T;
  readonly hasTarget: boolean;
  readonly cardArtSpritesheetNumber: number;
  readonly cardImageOffset: Vector2;
  readonly name: string;
  readonly school: School;
  readonly accuracy: number;
  readonly cost: SpellCost;
  readonly actions: SpellAction[];
}