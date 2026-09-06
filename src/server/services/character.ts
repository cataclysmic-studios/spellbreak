import { Service } from "@flamework/core";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { Workspace as World } from "@rbxts/services";

import { assets } from "shared/constants";
import Log from "shared/log";

@Service()
export class CharacterService {
  private selectedIndex = 0; // TODO: selection

  public getSelected(): number {
    return this.selectedIndex;
  }

  public teleportTo(player: Player, location: CFrame): void {
    const character = player.Character;
    Log.assert(character !== undefined, `${player} has no character to teleport`);
    character.PivotTo(location);
    // Zones are spread far apart with StreamingEnabled on, so without this the client's
    // streaming region is still centered on the old location when callers like ZoneService
    // immediately act on the new zone (e.g. hydrating NPCs), yielding on content that hasn't
    // streamed in yet.
    player.RequestStreamAroundAsync(location.Position);
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
    // Without this the client's streaming region is still centered wherever it defaulted to
    // (e.g. the baseplate origin) when DatabaseService fires dataLoaded right after this call,
    // which drives ZoneService into hydrating NPCs for a zone that hasn't streamed in yet.
    player.RequestStreamAroundAsync(location.Position);

    for (const part of getDescendantsOfType(character, "BasePart"))
      part.CollisionGroup = "Character";
  }
}