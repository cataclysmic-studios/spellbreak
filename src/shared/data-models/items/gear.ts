import type { CharacterItem } from "../character-item";
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

export interface Gear extends CharacterItem {
  readonly category: GearCategory;
  readonly sockets: Socket[];
}