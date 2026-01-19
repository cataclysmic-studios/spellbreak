import { Controller, type OnStart } from "@flamework/core";
import Vide, { mount, source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import { defaultData } from "shared/constants";
import { PlaceID } from "shared/structs/place-id";
import type { DialogID } from "shared/structs/npc/dialog";
import type { Interactable } from "shared/structs/interactable";
import Log from "shared/log";

import { OnlyInPlace } from "shared/ui/utility/components/only-in-place";
import { MainMenu } from "shared/ui/views/main-menu";
import { HUD, type HudProps } from "shared/ui/views/hud";

import type { CharacterController } from "./character";

@Controller()
export class UIController implements OnStart {
  private readonly hudState: HudProps = {
    character: source(defaultData.characters[0]),
    bookOpen: source(false),
    activeDialog: source<Maybe<DialogID>>(undefined),
    activeInteractable: source<Maybe<Interactable>>(undefined)
  };

  public constructor(character: CharacterController) {
    character.updated.Connect(() => this.hudState.character(character.getData()));
  }

  public onStart(): void {
    mount(() => <>
      <OnlyInPlace placeID={PlaceID.MainMenu}>
        {() => (
          <screengui Name="MainMenu" ScreenInsets="DeviceSafeInsets" ResetOnSpawn={false}>
            <MainMenu />
          </screengui>
        )}
      </OnlyInPlace>
      <OnlyInPlace placeID={PlaceID.InGame}>
        {() => (
          <screengui Name="HUD" ZIndexBehavior="Global" ScreenInsets="DeviceSafeInsets" ResetOnSpawn={false}>
            <HUD {...this.hudState} />
          </screengui>
        )}
      </OnlyInPlace>
    </>, playerGui);
    Log.info("Mounted game UI");
  }

  public createDialog(id: DialogID): void {
    Log.info("Created dialog with ID " + id);
    this.hudState.activeDialog(id);
  }

  public enableInteractPrompt(interactable: Interactable): void {
    this.hudState.activeInteractable(interactable);
  }

  public disableInteractPrompt(): void {
    this.hudState.activeInteractable(undefined);
  }
}