import type { BaseID } from "@rbxts/id";
import type { u8, f24 } from "@rbxts/serio";

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
}

/** `spellReference` is `undefined` for a pass. */
export interface DuelChoiceMadePacket extends BaseID<u8> {
  readonly spellReference?: SpellReference;
}

export interface PickUpQuestPacket extends BaseID<u8> {
  readonly npcID: u8;
}

export interface CompleteGoalPacket extends BaseID<u8> {
  readonly goalIndex: u8;
}