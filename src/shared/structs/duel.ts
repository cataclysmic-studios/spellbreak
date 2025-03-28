import type { Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import type { SpellCard } from "./spell-card";
import type { DeckDuelState } from "shared/classes/deck-duel-state";

export enum DuelPhase {
  Start,
  Planning,
  Combat,
  End
}

export const enum DuelCirclePosition {
  First,
  Second,
  Third,
  Fourth
}

export interface ClientDuelInfo extends BaseID<number> {
  readonly model: DuelCircleModel;
  readonly onOpposingTeam: boolean;
  readonly state: ClientDuelState;
}

export interface ClientDuelState {
  readonly deck: DeckDuelState;
  readonly hand: Source<SpellCard[]>;
  opponentCount: number;
  teamCount: number;
}