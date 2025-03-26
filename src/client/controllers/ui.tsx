import { Controller } from "@flamework/core";
import Vide, { type Source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import type { SpellCard } from "shared/structs/spell-card";

import { BattlePlanning } from "shared/ui/views/battle-planning";

@Controller()
export class UIController {
  private battlePlanningDestructor?: () => void;

  public enableBattlePlanning(hand: Source<SpellCard[]>): void {
    this.battlePlanningDestructor = Vide.mount(() => this.getBattlePlanning(hand), playerGui);
  }

  public disableBattlePlanning(): void {
    this.battlePlanningDestructor?.();
  }

  private getBattlePlanning(hand: Source<SpellCard[]>): Vide.Node {
    return (
      <screengui Name="BattlePlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} >
        <BattlePlanning hand={hand} />
      </screengui>
    );
  }
}