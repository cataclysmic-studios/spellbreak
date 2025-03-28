import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, SpellKind, SpellTargetKind } from "shared/structs/spell";

export = {
  name: "Mythblade",
  kind: SpellKind.Charm,
  school: School.Myth,
  reference: SpellReference.Myth_Mythblade,
  hasTarget: true,
  targetKind: SpellTargetKind.SingleTeam,
  cardArtSpritesheetNumber: 3,
  cardImageOffset: new Vector2(0, 2),
  accuracy: 100,
  cost: { pips: 0 },
  actions: [
    {
      type: SpellActionType.Buff.Blade,
      value: 35
    }
  ]
} satisfies Spell;