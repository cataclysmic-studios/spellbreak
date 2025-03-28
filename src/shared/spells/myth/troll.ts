import { School } from "shared/structs/school";
import { SpellActionKind } from "shared/structs/spell-actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, CardDescriptionImageKind, SpellKind, SpellTargetKind } from "shared/structs/spell";

const damage = {
  minimum: 100,
  maximum: 135
};

export = {
  name: "Troll",
  description: [
    `${damage.minimum}-${damage.maximum}`,
    { kind: CardDescriptionImageKind.School, value: School.Myth },
    { kind: CardDescriptionImageKind.SpellKind, value: SpellKind.Damage }
  ],
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
      kind: SpellActionKind.Damage.Hit,
      value: damage
    }
  ]
} satisfies Spell;