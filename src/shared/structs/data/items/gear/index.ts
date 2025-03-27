import type { CharacterItem } from "..";
import { GearReference } from "../../reference/gear";
import type { GearSocket } from "../sockets";

export const enum GearCategory {
  Hat,
  Robe,
  Boots,
  Wand,
  Athame,
  Amulet,
  Ring,
  Pet,
  Mount,
  Deck
}

export interface GearData extends CharacterItem {
  readonly category: GearCategory;
  readonly sockets: GearSocket[];
  readonly reference: GearReference | number;
}