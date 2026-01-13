import { Controller, OnStart } from "@flamework/core";
import { Timer } from "@rbxts/timer";
import Vide, { Source, mount, cleanup, source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import { timerLength } from "shared/constants";
import { getDialogByID } from "shared/utility/npc";
import { DialogID } from "shared/structs/npc/dialog";
import { PlaceID } from "shared/structs/place-id";
import type { ClientDuelInfo } from "shared/structs/duel";

import { OnlyInPlace } from "shared/ui/utility/components/only-in-place";
import { MainMenu } from "shared/ui/views/main-menu";
import { HUD, type HudProps } from "shared/ui/views/hud";
import { DuelPlanning } from "shared/ui/views/duel-planning";
import Log from "shared/log";

@Controller()
export class UIController implements OnStart {
  private readonly hudState: HudProps = {
    bookOpen: source(false),
    activeDialog: source<Maybe<DialogID>>(undefined)
  };

  private timer?: Timer;
  private duelPlanningDestructor?: () => void;

  public onStart(): void {
    Vide.mount(() => <>
      <OnlyInPlace placeID={PlaceID.MainMenu}>
        {() => (
          <screengui Name="MainMenu" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} ResetOnSpawn={false}>
            <MainMenu />
          </screengui>
        )}
      </OnlyInPlace>
      <OnlyInPlace placeID={PlaceID.InGame}>
        {() => (
          <screengui Name="HUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} ResetOnSpawn={false}>
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

  public enableDuelPlanning(duelInfo: ClientDuelInfo): void {
    this.timer = new Timer(timerLength);
    this.timer.start();

    this.duelPlanningDestructor = mount(() => {
      const component = (
        <screengui Name="DuelPlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}>
          <DuelPlanning duelInfo={duelInfo} timer={() => this.timer!} />
        </screengui>
      );

      cleanup(component as Instance);
      return component;
    }, playerGui);
  }

  public disableDuelPlanning(): void {
    this.duelPlanningDestructor?.();
    this.timer?.destroy();
    this.timer = undefined;
  }
}