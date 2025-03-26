import type { School } from "./school";
import type { SpellAction } from "./spell-actions";

interface SpellCost {
  readonly pips: number | "X";
  readonly shadowPips?: number;
}

export const enum SpellType {
  Damage,
  DamageAll,
  Drain,
  Healing,
  Charm,
  Ward,
  Aura,
  Global,
  Enchantment,
  Manipulation,
  Polymorph,
  Mutate
}

export interface CardImage {
  readonly colored: string;
  readonly grayscale: string;
}

export interface Spell<T extends SpellType = SpellType> {
  readonly type: T;
  readonly hasTarget: boolean;
  readonly cardImage: CardImage;
  readonly treasureCardImage: CardImage;
  readonly name: string;
  readonly school: School;
  readonly accuracy: number;
  readonly cost: SpellCost;
  readonly actions: SpellAction[];
}