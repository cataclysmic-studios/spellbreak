import { School } from "./school";

interface PerSchoolStats<T> {
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

export interface CharacterData {
  readonly name: string;
  readonly school: School;
  readonly level: number;
  readonly xp: number;
  readonly gold: number;
  readonly trainingPoints: number;
  readonly lastLocation: Vector3;
  readonly stats: CharacterStats;
}

export interface PlayerData {
  readonly crowns: number;
  readonly characters: CharacterData[];
}