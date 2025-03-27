import { Controller } from "@flamework/core";
import Vide, { type Source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";

import { DuelPlanning } from "shared/ui/views/duel-planning";

@Controller()
export class UIController {
  private battlePlanningDestructor?: () => void;

  public enableBattlePlanning(deckState: DeckDuelState, hand: Source<SpellCard[]>): void {
    this.battlePlanningDestructor = Vide.mount(() => (
      <screengui Name="BattlePlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} >
        <DuelPlanning deckState={deckState} hand={hand} />
      </screengui>
    ), playerGui);
  }

  public disableBattlePlanning(): void {
    this.battlePlanningDestructor?.();
  }
}