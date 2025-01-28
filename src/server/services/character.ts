import { Service } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";

import type { OnPlayerJoin } from "server/hooks/players";
import { assets } from "shared/constants";

@Service()
export class CharacterService implements OnPlayerJoin {
  public onPlayerJoin(player: Player): void {
    this.load(player, "roslyn", new CFrame(0, 5, 0));
  }

  public load(player: Player, characterName: ExtractKeys<typeof assets.characters, CharacterModel>, location: CFrame): void {
    const character = assets.characters[characterName].Clone(); // completely temporary
    player.CanLoadCharacterAppearance = false;
    player.LoadCharacter();
    task.wait();

    character.Name = player.Name;
    character.Parent = World;
    character.PivotTo(location);
    player.Character = character;
  }
}