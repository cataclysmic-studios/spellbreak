import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, SpellType } from "shared/structs/spell";

export = {
  name: "Troll",
  type: SpellType.Damage,
  school: School.Myth,
  reference: SpellReference.Myth_Troll,
  cardArtSpritesheetNumber: 2,
  cardImageOffset: new Vector2(1, 2),
  hasTarget: true,
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