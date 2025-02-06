import { School } from "../school";
import { EnemyClass } from "./class";
import { EnemyKind } from "./kind";

export interface EnemyDescriptor {
  readonly name: string;
  readonly health: number;
  readonly schools: School[];
  readonly rank: number;
  readonly kind: EnemyKind;
  readonly class: EnemyClass;
  readonly stunnable: boolean;
  readonly startingPips: number;
  // TODO: boost, resist, drops, deck
}