import type { School } from "./school";
import type { SpellAction } from "./spell-actions";
import type { SpellCardKind } from "./spell-card";
import type { SpellReference } from "./data/reference/spell";
import type { ReferenceWithData } from "./data/reference";

interface SpellCost {
  readonly pips: number | "X";
  readonly shadowPips?: number;
}

export const enum SpellKind {
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

export const enum SpellTargetKind {
  SingleTeam,
  SingleEnemy,
  MultipleEnemies
}

export type SpellReferenceData = ReferenceWithData<SpellLinkedData, SpellReference>;

export interface SpellLinkedData {
  readonly spellCardKind: SpellCardKind;
}

interface BaseSpell {
  readonly kind: SpellKind;
  readonly hasTarget: boolean;
  readonly targetKind?: SpellTargetKind;
  readonly cardArtSpritesheetNumber: number;
  readonly cardImageOffset: Vector2;
  readonly name: string;
  readonly school: School;
  readonly accuracy: number;
  readonly cost: SpellCost;
  readonly actions: SpellAction[];
  readonly reference: SpellReference;
}

export type Spell = BaseSpell & ({
  readonly hasTarget: true;
  readonly targetKind: SpellTargetKind;
} | {
  readonly hasTarget: false;
  readonly targetKind?: undefined;
})