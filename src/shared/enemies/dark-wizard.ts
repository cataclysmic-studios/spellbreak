import { School } from "shared/structs/school";
import { EnemyKind } from "shared/structs/enemy/kind";
import { EnemyClass } from "shared/structs/enemy/class";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

export = {
  name: "Dark Wizard",
  health: 80,
  school: School.Death,
  kind: EnemyKind.Regular,
  class: EnemyClass.Undead,
  stunnable: true,
  startingPips: 1
} satisfies EnemyDescriptor;