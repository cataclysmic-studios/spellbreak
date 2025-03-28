import { Controller } from "@flamework/core";
import { Timer } from "@rbxts/timer";
import Vide from "@rbxts/vide";

import { playerGui } from "client/constants";
import type { ClientDuelInfo } from "shared/structs/duel";

import { DuelPlanning } from "shared/ui/views/duel-planning";

@Controller()
export class UIController {
  private duelPlanningDestructor?: () => void;

  public enableDuelPlanning(duelInfo: ClientDuelInfo): void {
    const timer = new Timer(30);
    this.duelPlanningDestructor = Vide.mount(() => (
      <screengui Name="DuelPlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} >
        <DuelPlanning duelInfo={duelInfo} timer={timer} />
      </screengui>
    ), playerGui);
  }

  public disableDuelPlanning(): void {
    this.duelPlanningDestructor?.();
  }
}