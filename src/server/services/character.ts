import { Service, type OnInit } from "@flamework/core";

import { Events } from "server/network";

@Service()
export class CharacterService implements OnInit {
  private currentIndex = 0;

  public onInit(): void {
    Events.character.playAs.connect((_, index) => this.currentIndex = index);
    Events.character.toggleDefaultMovement.connect((player, on) => this.toggleDefaultMovement(player, on));
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public toggleDefaultMovement(player: Player, on: boolean): void {
    player.DevComputerMovementMode = on ? Enum.DevComputerMovementMode.KeyboardMouse : Enum.DevComputerMovementMode.Scriptable;
    player.DevTouchMovementMode = on ? Enum.DevTouchMovementMode.DynamicThumbstick : Enum.DevTouchMovementMode.Scriptable;
  }
}