import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, SpellKind, SpellTargetKind } from "shared/structs/spell";

export = {
  name: "Troll",
  kind: SpellKind.Damage,
  school: School.Myth,
  reference: SpellReference.Myth_Troll,
  hasTarget: true,
  targetKind: SpellTargetKind.SingleEnemy,
  cardArtSpritesheetNumber: 2,
  cardImageOffset: new Vector2(1, 2),
  accuracy: 85,
  cost: { pips: 1 },
  actions: [
    {
      type: SpellActionType.Damage.Hit,
      value: {
        minimum: 100,
        maximum: 135
      }
    }
  ]
} satisfies Spell;