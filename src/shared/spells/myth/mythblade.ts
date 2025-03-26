import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { type Spell, SpellType } from "shared/structs/spell";

export = {
  name: "Mythblade",
  type: SpellType.Charm,
  school: School.Myth,
  cardImage: {
    colored: "",
    grayscale: ""
  },
  treasureCardImage: {
    colored: "",
    grayscale: ""
  },
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