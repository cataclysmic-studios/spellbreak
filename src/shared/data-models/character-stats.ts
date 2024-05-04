import type { School } from "./school";

export default interface CharacterStats {
  maxHealth: number;
  maxMana: number;
  maxEnergy: number;
  health: number;
  mana: number;
  energy: number;

  readonly damage: Record<School, number>;
  readonly flatDamage: Record<School, number>;
  readonly resist: Record<School, number>;
  readonly flatResist: Record<School, number>;
  readonly accuracy: Record<School, number>;
  readonly criticalRating: Record<School, number>;
  readonly criticalBlockRating: Record<School, number>;
  readonly piercing: Record<School, number>;
  powerPipChance: number;
  shadowPipRating: number;
  stunResistance: number;
  maxShadowPips: number;

  readonly healing: {
    incoming: number;
    outgoing: number;
  };
}
