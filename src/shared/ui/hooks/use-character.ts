import { read, type Derivable } from "@rbxts/vide";
import type { CharacterData, PlayerData } from "shared/structs/data";

export function useCharacter(player: Derivable<PlayerData>, characterIndex: Derivable<number>): () => CharacterData {
  return () => read(player).characters[read(characterIndex)];
}
