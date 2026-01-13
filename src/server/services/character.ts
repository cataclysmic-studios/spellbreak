import { Service } from "@flamework/core";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { Workspace as World } from "@rbxts/services";

import type { OnPlayerJoin } from "server/hooks/players";
import { assets } from "shared/constants";
import Log from "shared/log";

@Service()
export class CharacterService implements OnPlayerJoin {
  private selectedIndex = 0; // TODO: selection

  public onPlayerJoin(player: Player): void {
    this.load(player, "roslyn", new CFrame(0, 5, 0));
  }

  public getSelected(): number {
    return this.selectedIndex;
  }

  public load(player: Player, modelName: ExtractKeys<typeof assets.characters, CharacterModel>, location: CFrame): void {
    Log.info(`Loaded '${modelName}' character model`);
    const character = assets.characters[modelName].Clone(); // 100% temporary
    player.CanLoadCharacterAppearance = false;
    player.LoadCharacter();
    task.wait();

    character.Name = player.Name;
    character.Parent = World;
    character.PivotTo(location);
    player.Character = character;

    for (const part of getDescendantsOfType(character, "BasePart"))
      part.CollisionGroup = "Character";
  }
}