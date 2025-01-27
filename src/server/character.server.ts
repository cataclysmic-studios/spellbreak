import { Players } from "@rbxts/services";
import { assets } from "shared/constants";

const currentCharacter = assets.characters.roslyn;
function spawnCharacter(player: Player): void {
  player.Character = currentCharacter.Clone();
  player.LoadCharacter();
}

Players.PlayerAdded.Connect(spawnCharacter);