import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { type Spell, SpellType } from "shared/structs/spell";

export = {
  name: "Troll",
  type: SpellType.Damage,
  school: School.Myth,
  cardArtSpritesheetNumber: 1,
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