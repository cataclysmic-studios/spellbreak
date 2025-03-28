import type { RangeJSON } from "@rbxts/range";

export type SpellActionValueType =
  | number
  | RangeJSON
  | undefined;

export enum SpellActionKind {
  Heal = "Heal",
  HealAOE = "HealAOE",
}

export namespace SpellActionKind {
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

export type SpellActionKinds =
  | SpellActionKind
  | SpellActionKind.Buff
  | SpellActionKind.Debuff
  | SpellActionKind.Damage
  | SpellActionKind.Manipulation
  | SpellActionKind.Exclusive;

export interface SpellAction<T extends SpellActionKinds = SpellActionKinds> {
  readonly kind: T;
  readonly value: SpellActionValueType;
}