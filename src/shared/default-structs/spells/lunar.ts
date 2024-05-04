import { School } from "shared/data-models/school";
import { SpellType } from "shared/structs/spell";
import { SpellActionType } from "shared/structs/spell-action";
import { RangeData } from "shared/utility/range";
import SpellsList from "./list";

const LunarSpells: SpellsList = {
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

export default LunarSpells;