import { School } from "shared/data-models/school";
import { SpellType } from "shared/structs/spell";
import { SpellActionType } from "shared/structs/spell-action";
import SpellsList from "./list";

const MythSpells: SpellsList = {
  [SpellType.Damage]: [
    {
      type: SpellType.Damage,
      cardImage: "rbxassetid://16807903671",
      greyscaleCardImage: "rbxassetid://17387736137",
      hasTarget: true,
      name: "Goblin",
      school: School.Myth,
      accuracy: 85,
      cost: {
        pips: 1,
        shadowPips: 0
      },
      actions: [
        {
          type: SpellActionType.Damage.Hit,
          value: {
            minimum: 100,
            maximum: 135
          }
        }
      ]
    }
  ],
  [SpellType.DamageAll]: [],
  [SpellType.Drain]: [],
  [SpellType.Healing]: [],
  [SpellType.Charm]: [
    {
      type: SpellType.Charm,
      hasTarget: true,
      cardImage: "",
      greyscaleCardImage: "",
      name: "Mythblade",
      school: School.Myth,
      accuracy: 100,
      cost: {
        pips: 0,
        shadowPips: 0
      },
      actions: [
        {
          type: SpellActionType.Buff.Blade,
          value: 35
        }
      ]
    }
  ],
  [SpellType.Ward]: [],
  [SpellType.Aura]: [],
  [SpellType.Global]: [],
  [SpellType.Enchantment]: [],
  [SpellType.Manipulation]: [],
  [SpellType.Polymorph]: [],
  [SpellType.Mutate]: []
};

export default MythSpells;