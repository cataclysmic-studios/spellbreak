import { Controller } from "@flamework/core";
import { Timer } from "@rbxts/timer";
import Vide, { mount, cleanup, source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import { OnMessage } from "client/decorators";
import { timerLength } from "shared/constants";
import { Message } from "shared/messaging";
import type { ClientDuelInfo } from "shared/structs/duel";

import { DuelPlanning } from "shared/ui/views/duel-planning";

@Controller()
export class UIController {
  private readonly currentTimer = source<Maybe<Timer>>();
  private duelPlanningDestructor?: () => void;

  /** @hidden */
  @OnMessage(Message.DuelUpdateTimer)
  public updateDuelTimer(): void {
    if (this.currentTimer() === undefined) return;
    const oldTimer = this.currentTimer()!;
    this.currentTimer(new Timer(timerLength));
    this.currentTimer()!.start();
    oldTimer.destroy();
  }

  public enableDuelPlanning(duelInfo: ClientDuelInfo): void {
    this.currentTimer(new Timer(timerLength));
    this.currentTimer()!.start();
    this.duelPlanningDestructor = mount(() => {
      const component = (
        <screengui Name="DuelPlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets}>
          <DuelPlanning duelInfo={duelInfo} timer={() => this.currentTimer()!} />
        </screengui>
      );

      cleanup(component as Instance);
      return component;
    }, playerGui);
  }

  public disableDuelPlanning(): void {
    this.duelPlanningDestructor?.();
    this.currentTimer(undefined);
  }
}