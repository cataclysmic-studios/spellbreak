import { Service, } from "@flamework/core";

import type { OnPlayerJoin } from "server/hooks/players";
import { assets } from "shared/constants";

@Service()
export class CharacterService implements OnPlayerJoin {
  private currentCharacter = assets.characters.roslyn;

  public onPlayerJoin(player: Player): void {
    player.CanLoadCharacterAppearance = false;

    const trashCharacterPivot = player.Character?.GetPivot() ?? new CFrame;
    player.Character = this.currentCharacter.Clone();
    player.LoadCharacter();
    player.Character.PivotTo(trashCharacterPivot)
    player.Character.WaitForChild("Health").Destroy();
    player.Character.WaitForChild("Animate").Destroy();
  }
}