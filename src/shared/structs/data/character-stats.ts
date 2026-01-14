import type { School } from "../school";

export interface PerSchoolStats<T> {
  readonly [School.Fire]: T;
  readonly [School.Ice]: T;
  readonly [School.Storm]: T;
  readonly [School.Life]: T;
  readonly [School.Death]: T;
  readonly [School.Myth]: T;
  readonly [School.Balance]: T;
  readonly [School.Stellar]: T;
  readonly [School.Lunar]: T;
  readonly [School.Solar]: T;
  readonly [School.Shadow]: T;
}

export interface CharacterStats {
  readonly health: number;
  readonly mana: number;
  readonly energy: number;
  readonly maxMana: number;
  readonly maxHealth: number;
  readonly maxEnergy: number;
  readonly incomingHealing: number;
  readonly outgoingHealing: number;
  readonly powerPipChance: number;
  readonly shadowPipRating: number;
  readonly stunResistance: number;
  readonly damage: PerSchoolStats<number>;
  readonly resist: PerSchoolStats<number>;
  readonly accuracy: PerSchoolStats<number>;
  readonly criticalRating: PerSchoolStats<number>;
  readonly criticalBlockRating: PerSchoolStats<number>;
  readonly pierce: PerSchoolStats<number>;
}