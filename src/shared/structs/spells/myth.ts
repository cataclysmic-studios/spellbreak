import { School } from "shared/structs/school";
import { SpellType, type Spell } from "shared/structs/spell";
import { SpellActionType } from "shared/structs/spell-action";
import Range from "shared/utility/range";
import SpellsList from "./list";

const MythSpells: SpellsList = {
  [SpellType.Damage]: [
    {
      type: SpellType.Damage,
      image: "rbxassetid://16807903671",
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
          value: new Range(100, 135)
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
      image: "",
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