import type { CharacterItem } from "./base";
import type CharacterStats from "../character-stats";

export default interface Jewel extends CharacterItem {
  readonly stats: CharacterStats;
}