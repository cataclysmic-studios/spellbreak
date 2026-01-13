import type { BaseID } from "@rbxts/id";
import type { u8, f24 } from "@rbxts/serio";

export interface TransitionPosePacket {
  readonly poseKind: u8;
  readonly duration: f24;
}

export interface PickUpQuestPacket extends BaseID<u8> {
  readonly npcID: u8;
}

export interface CompleteGoalPacket extends BaseID<u8> {
  readonly goalIndex: u8;
}