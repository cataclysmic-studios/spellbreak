import type { RangeData } from "shared/classes/range";

export type SpellActionValueType =
  | number
  | [number, number]
  | RangeData
  | undefined;

export enum SpellActionType {
  Heal = "Heal",
  HealAOE = "HealAOE",
}

export namespace SpellActionType {
  export const enum Buff {
    Blade = "Blade",
    Aura = "Aura",
    Global = "Global",
    Trap = "Trap"
  }

  export const enum Debuff {
    NegativeCharm = "NegativeCharm",
    Shield = "Shield"
  }

  export const enum Damage {
    Hit = "Hit",
    HitAOE = "HitAOE",
    DrainHit = "DrainHit",
    DrainHitAOE = "DrainHitAOE",
    DOT = "DOT",
    DOTAOE = "DOTAOE"
  }

  export const enum Manipulation {
    StealPips = "StealPips",
    GainPips = "GainPips",
    SummonMinion = "SummonMinion",
    CleanseNegativeCharms = "CleanseNegativeCharm",
    CleanseTraps = "CleanseTraps",
    StripShields = "StripShields",
    StripBlades = "StripBlades",
    StealShields = "StealShields",
    StealBlades = "StealBlades",
    Stun = "Stun",
    StunAOE = "StunAOE"
  }

  export const enum Exclusive {
    Reshuffle = "Reshuffle",
    Detonate = "Detonate"
  }
}

export type SpellActionTypes =
  | SpellActionType
  | SpellActionType.Buff
  | SpellActionType.Debuff
  | SpellActionType.Damage
  | SpellActionType.Manipulation
  | SpellActionType.Exclusive;

export interface SpellAction<T extends SpellActionTypes = SpellActionTypes> {
  readonly type: T;
  readonly value: SpellActionValueType;
}