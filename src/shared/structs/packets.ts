import type { u8, f24 } from "@rbxts/serio";

export interface TransitionPosePacket {
  readonly poseKind: u8;
  readonly duration: f24;
}