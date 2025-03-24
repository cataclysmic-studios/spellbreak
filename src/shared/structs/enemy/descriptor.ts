import type { School } from "../school";
import type { EnemyClass } from "./class";
import type { EnemyKind } from "./kind";

export const enum DamageModifierKind {
  Standard,
  Advanced,
  Custom
}

export interface BaseEnemyDescriptor {
  readonly name: string;
  readonly health: number;
  readonly schools: School[];
  readonly rank: number;
  readonly kind: EnemyKind;
  readonly class: EnemyClass;
  readonly stunnable: boolean;
  readonly startingPips: number;
  readonly boostKind: DamageModifierKind;
  readonly resistKind: DamageModifierKind;
  readonly boosts?: Map<School, number>;
  readonly resists?: Map<School, number>;
  // TODO: drops, deck
}

export type EnemyDescriptor = BaseEnemyDescriptor
  & ({
    readonly boostKind: DamageModifierKind.Custom;
    readonly boosts: Map<School, number>;
  } | {
    readonly boostKind: Exclude<DamageModifierKind, DamageModifierKind.Custom>;
    readonly boosts?: undefined;
  })
  & ({
    readonly resistKind: DamageModifierKind.Custom;
    readonly resists: Map<School, number>;
  } | {
    readonly resistKind: Exclude<DamageModifierKind, DamageModifierKind.Custom>;
    readonly resists?: undefined;
  });