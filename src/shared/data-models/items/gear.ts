import type { CharacterItem, WithCharacterStats, WithRequirements } from "./base";
import type { Socket } from "../sockets";

export const enum GearCategory {
  Hat = "Hat",
  Robe = "Robe",
  Boots = "Boots",
  Wand = "Wand",
  Athame = "Athame",
  Amulet = "Amulet",
  Ring = "Ring",
  Pet = "Pet",
  Mount = "Mount",
  Deck = "Deck"
}

export interface Gear extends CharacterItem, WithRequirements, WithCharacterStats {
  readonly category: GearCategory;
  readonly sockets: Socket[];
}