import type { Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";

import type { SpellCard } from "./spell-card";
import type { SpellReference } from "./data/reference/spell";
import type { ClientDuelDeckState } from "shared/classes/client-deck-duel-state";

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
  readonly deck: ClientDuelDeckState;
  readonly hand: Source<SpellCard[]>;
  readonly choosing: Source<boolean>;
  readonly selectedCard: Source<Maybe<SpellCard>>;
  opponentCount: number;
  teamCount: number;
}

export interface DuelChoice<T extends number = DuelCirclePosition> {
  readonly spellReference: SpellReference;
  readonly target?: T;
  readonly targetIsOpponent?: boolean;
}