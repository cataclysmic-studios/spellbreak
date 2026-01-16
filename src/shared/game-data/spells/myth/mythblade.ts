import { School } from "shared/structs/school";
import { SpellActionKind } from "shared/structs/spell/actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, CardDescriptionImageKind, SpellKind, SpellTargetKind } from "shared/structs/spell";

const buff = 35;

export = {
  name: "Mythblade",
  description: [
    `+${buff}% to next`,
    { kind: CardDescriptionImageKind.School, value: School.Myth },
    { kind: CardDescriptionImageKind.SpellKind, value: SpellKind.Damage },
    "spell"
  ],
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
      kind: SpellActionKind.Buff.Blade,
      value: buff
    }
  ]
} satisfies Spell;