import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { EnemyClass } from "shared/structs/enemy/class";
import { DamageModifierKind, EnemyID, type EnemyDescriptor } from "shared/structs/enemy/descriptor";

export = {
  id: EnemyID.Shatterbones,
  name: "Shatterbones",
  health: 280,
  schools: [School.Ice],
  rank: 1,
  kind: EnemyKind.Boss,
  class: EnemyClass.Undead,
  stunnable: true,
  startingPips: 1,
  boostKind: DamageModifierKind.Standard,
  resistKind: DamageModifierKind.Standard
} satisfies EnemyDescriptor;