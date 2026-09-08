import type { Derivable, Source } from "@rbxts/vide";
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

export interface DuelChoiceTarget {
  readonly position: DuelCirclePosition;
  readonly isOpponent: boolean;
}

/**
 * Locks in `spellReference` (and `target`, `undefined` for a no-target spell) as this round's
 * choice - owned by `DuelPlanning` (the `Show` that unmounts the hand once `choosing` drops lives
 * there too), not by whichever card button's click ends up calling it, so that unmount never
 * races the native callback that triggered it.
 */
export type CommitDuelChoice = (spellReference: SpellReference, target: Maybe<DuelChoiceTarget>) => void;

export interface ClientDuelState {
  readonly hand: Source<SpellCard[]>;
  readonly sideboardCount: Source<number>;
  readonly choosing: Source<boolean>;
  readonly selectedCard: Source<Maybe<SpellCard>>;
  /** The spell reference locked in once `choosing` drops, `undefined` for a pass. Set by whatever confirms the choice (the Pass button, a no-target spell's card button, or a target pick), then read (and reset) by the `Duel_ChoiceMade` effect in `DuelPlanning`. */
  readonly chosenSpellReference: Source<Maybe<SpellReference>>;
  /** The target locked in alongside `chosenSpellReference`, `undefined` for a pass or a no-target spell. */
  readonly chosenTarget: Source<Maybe<DuelChoiceTarget>>;
  readonly pipValue: Source<number>;
  opponentCount: number;
  teamCount: number;
}

export interface DuelChoice {
  readonly spellReference: SpellReference;
  readonly target?: DuelCirclePosition;
  readonly targetIsOpponent?: boolean;
}

/**
 * Tracks a duel for as long as its combat is ongoing - from planning through casting - so the
 * main HUD can stay hidden for the whole fight rather than just the planning phase. `planning`
 * toggles off once casting begins, which is what actually hides the `DuelPlanning` subview.
 */
export interface ActiveDuelState {
  readonly info: ClientDuelInfo;
  readonly timer: Derivable<Timer>;
  readonly planning: Source<boolean>;
}