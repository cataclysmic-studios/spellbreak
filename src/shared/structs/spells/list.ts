import type { Spell, SpellType } from "../spell";

type SpellsList = Record<SpellType, Spell[]>;
export default SpellsList;