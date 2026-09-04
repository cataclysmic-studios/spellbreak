import type { Source } from "@rbxts/vide";
import type { BaseID } from "@rbxts/id";
import type { Timer } from "@rbxts/timer";

import type { SpellCard } from "./spell/card";
import type { SpellReference } from "./data/reference/spell";

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
  /** Whether the team side (as opposed to the opponent side) casts first this round - mirrors `pointAtFirstTurnCombatant`'s pick, so the casting camera can focus the same combatant the pointer points at. */
  readonly firstTurnOnTeam: boolean;
  readonly state: ClientDuelState;
}

export interface ClientDuelState {
  // readonly deck: ClientDuelDeckState;
  readonly hand: Source<SpellCard[]>;
  readonly choosing: Source<boolean>;
  readonly selectedCard: Source<Maybe<SpellCard>>;
  /** The spell reference locked in once `choosing` drops, `undefined` for a pass. Set by whatever confirms the choice (the Pass button, a no-target spell's card button, or a target pick), then read (and reset) by the `Duel_ChoiceMade` effect in `DuelPlanning`. */
  readonly chosenSpellReference: Source<Maybe<SpellReference>>;
  readonly pipValue: Source<number>;
  opponentCount: number;
  teamCount: number;
}

export interface DuelChoice<T extends number = DuelCirclePosition> {
  readonly spellReference: SpellReference;
  readonly target?: T;
  readonly targetIsOpponent?: boolean;
}

/**
 * Tracks a duel for as long as its combat is ongoing - from planning through casting - so the
 * main HUD can stay hidden for the whole fight rather than just the planning phase. `planning`
 * toggles off once casting begins, which is what actually hides the `DuelPlanning` subview.
 */
export interface ActiveDuelState {
  readonly info: ClientDuelInfo;
  readonly timer: Source<Timer>;
  readonly planning: Source<boolean>;
}