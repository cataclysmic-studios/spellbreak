import { School } from "shared/data-models/school";
import { SpellType } from "shared/structs/spell";
import { SpellActionType } from "shared/structs/spell-action";
import { RangeData } from "shared/classes/range";
import SpellsList from "./list";

const FireSpells: SpellsList = {
  [SpellType.Damage]: [],
  [SpellType.DamageAll]: [],
  [SpellType.Drain]: [],
  [SpellType.Healing]: [],
  [SpellType.Charm]: [],
  [SpellType.Ward]: [],
  [SpellType.Aura]: [],
  [SpellType.Global]: [],
  [SpellType.Enchantment]: [],
  [SpellType.Manipulation]: [],
  [SpellType.Polymorph]: [],
  [SpellType.Mutate]: []
};

export default FireSpells;