import type { Spell, SpellType } from "../../structs/spell";

type SpellsList = Record<SpellType, Spell[]>;
export default SpellsList;