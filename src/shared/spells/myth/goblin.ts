import { School } from "shared/structs/school";
import { SpellActionType } from "shared/structs/spell-actions";
import { type Spell, SpellType } from "shared/structs/spell";

export = {
  name: "Goblin",
  type: SpellType.Damage,
  school: School.Myth,
  cardImage: {
    colored: "rbxassetid://16807903671",
    grayscale: "rbxassetid://17387736137"
  },
  treasureCardImage: {
    colored: "",
    grayscale: ""
  },
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