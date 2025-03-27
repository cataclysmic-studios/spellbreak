import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { SpellReference } from "shared/structs/data/reference/spell";
import { type Spell, SpellType } from "shared/structs/spell";

export = {
  name: "Mythblade",
  type: SpellType.Charm,
  school: School.Myth,
  reference: SpellReference.Myth_Mythblade,
  cardArtSpritesheetNumber: 3,
  cardImageOffset: new Vector2(0, 2),
  hasTarget: true,
  accuracy: 100,
  cost: { pips: 0 },
  actions: [
    {
      type: SpellActionType.Buff.Blade,
      value: 35
    }
  ]
} satisfies Spell;