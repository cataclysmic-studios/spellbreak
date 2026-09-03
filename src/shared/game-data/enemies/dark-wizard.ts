import { School } from "shared/structs/school";
import { ZoneID } from "shared/structs/zone";
import { EnemyKind } from "shared/structs/enemy/kind";
import { EnemyClass } from "shared/structs/enemy/class";
import { DamageModifierKind, EnemyID, type EnemyDescriptor } from "shared/structs/enemy/descriptor";

export = {
  id: EnemyID.DarkWizard,
  name: "Dark Wizard",
  zone: ZoneID.PegasusLane,
  health: 80,
  schools: [School.Death],
  rank: 1,
  kind: EnemyKind.Regular,
  class: EnemyClass.Undead,
  stunnable: true,
  startingPips: 1,
  boostKind: DamageModifierKind.Standard,
  resistKind: DamageModifierKind.Standard
} satisfies EnemyDescriptor;