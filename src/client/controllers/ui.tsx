import { Controller } from "@flamework/core";
import { Timer } from "@rbxts/timer";
import Vide, { type Source } from "@rbxts/vide";

import { playerGui } from "client/constants";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";

import { DuelPlanning } from "shared/ui/views/duel-planning";

@Controller()
export class UIController {
  private duelPlanningDestructor?: () => void;

  public enableDuelPlanning(deckState: DeckDuelState, hand: Source<SpellCard[]>): void {
    const timer = new Timer(30);
    this.duelPlanningDestructor = Vide.mount(() => (
      <screengui Name="DuelPlanningHUD" ScreenInsets={Enum.ScreenInsets.DeviceSafeInsets} >
        <DuelPlanning deckState={deckState} timer={timer} hand={hand} />
      </screengui>
    ), playerGui);
  }

  public disableDuelPlanning(): void {
    this.duelPlanningDestructor?.();
  }
}