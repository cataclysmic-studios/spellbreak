import type { BaseID } from "@rbxts/id";
import type { u8, u16, f24 } from "@rbxts/serio";

import type { SpellReferenceData } from "./spell";
import type { SpellReference } from "./data/reference/spell";

export interface TransitionPosePacket {
  readonly poseKind: u8;
  readonly duration: f24;
}

export interface DuelStartPacket extends BaseID<u8> {
  readonly model: DuelCircleModel;
  readonly onOpposingTeam: boolean;
  readonly firstTurnOnTeam: boolean;
  readonly opponentCount: u8;
  readonly teamCount: u8;
  readonly pipValue: u8;
  readonly hand: SpellReferenceData[];
  readonly sideboardCount: u8;
}

/** `spellReference` is `undefined` for a pass. `target`/`targetIsOpponent` are only present for a targeted spell. */
export interface DuelChoiceMadePacket extends BaseID<u8> {
  readonly spellReference?: SpellReference;
  readonly target?: u8; // DuelCirclePosition
  readonly targetIsOpponent?: boolean;
}

export interface DuelCastTargetResult {
  readonly targetPosition: u8; // DuelCirclePosition
  readonly targetIsOpponent: boolean;
  readonly missed: boolean;
  /** Actual damage dealt - absent for a miss or a non-damaging effect. */
  readonly damage?: u16;
}

/** One resolved spell cast from a round - for A3/A4 (turn indicator, spell animations) to eventually animate against. */
export interface DuelCastResolvedPacket extends BaseID<u8> {
  readonly casterPosition: u8; // DuelCirclePosition
  readonly casterIsOpponent: boolean;
  readonly spellReference: SpellReference;
  readonly results: DuelCastTargetResult[];
}

export interface DuelNextRoundPacket extends BaseID<u8> {
  readonly pipValue: u8;
}

export interface DuelSideboardDrawnPacket extends BaseID<u8> {
  readonly spellReference: SpellReference;
  readonly sideboardRemaining: u8;
}

export interface DuelEndedPacket extends BaseID<u8> {
  readonly victory: boolean;
}

export interface PickUpQuestPacket extends BaseID<u8> {
  readonly npcID: u8;
}

export interface CompleteGoalPacket extends BaseID<u8> {
  readonly goalIndex: u8;
}