import type { School } from "./school";

export default interface CharacterStats {
  readonly health: number;
  readonly mana: number;
  readonly energy: number;

  readonly damage: Record<School, number>;
  readonly flatDamage: Record<School, number>;
  readonly resist: Record<School, number>;
  readonly flatResist: Record<School, number>;
  readonly accuracy: Record<School, number>;
  readonly criticalRating: Record<School, number>;
  readonly criticalBlockRating: Record<School, number>;
  readonly piercing: Record<School, number>;
  readonly powerPipChance: number;
  readonly shadowPipRating: number;
  readonly stunResistance: number;
  readonly healing: {
    readonly incoming: number;
    readonly outgoing: number;
  };
}
