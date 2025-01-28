import { Controller, type OnStart } from "@flamework/core";

import { Character } from "client/classes/character";
import { player } from "shared/constants";

@Controller()
export class CharacterController implements OnStart {
  private character!: Character;

  public onStart(): void {
    const model = player.Character ?? player.CharacterAdded.Wait()[0];
    this.character = new Character(model as CharacterModel);
  }

  public get(): Character {
    return this.character;
  }
}