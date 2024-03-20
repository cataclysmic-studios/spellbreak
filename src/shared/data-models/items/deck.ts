import type { Spell } from "../../structs/spell";
import type { Gear } from "./gear";

export default interface Deck extends Gear {
  readonly maxSpells: number;
  readonly maxCopies: number;
  readonly maxSchoolCopies: number;
  readonly sideboardSize: number;

  readonly spells: Spell[];
  readonly sideboardSpells: Spell[];
}