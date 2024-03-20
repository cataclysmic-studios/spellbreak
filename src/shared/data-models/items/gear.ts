import type { CharacterItem, WithCharacterStats, WithRequirements } from "./base";
import type { Socket } from "../sockets";

export default interface Gear extends CharacterItem, WithRequirements, WithCharacterStats {
  readonly sockets: Socket[];
}