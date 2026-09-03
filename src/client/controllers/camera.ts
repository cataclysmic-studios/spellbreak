import { Controller, type OnRender } from "@flamework/core";
import { atom } from "@rbxts/charm";
import Signal from "@rbxts/lemon-signal";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { CameraManager } from "client/classes/camera-manager";
import { CameraPoseKind } from "shared/structs/camera";

import { BaseCameraPose } from "client/camera-poses/base";
import { CharacterCameraPose } from "client/camera-poses/character";
import { DuelPlanningPose } from "client/camera-poses/duel-planning";
import { DuelCastingOverviewPose } from "client/camera-poses/duel-casting-overview";
import { DuelCastingPose } from "client/camera-poses/duel-casting";

@Controller()
export class CameraController implements OnRender {
  public readonly manager = new CameraManager;
  public readonly duelCameraHeight = atom(24);
  public readonly duelCameraDistance = atom(42);
  /** Fires once a `transitionPose` finishes easing into its target pose. */
  public readonly transitionCompleted = new Signal<(kind: CameraPoseKind) => void>;

  private readonly cachedPoses: Partial<Record<CameraPoseKind, BaseCameraPose>> = {};

  public constructor() {
    this.manager.setPose(this.createPose(CameraPoseKind.Character));
  }

  public onRender(dt: number): void {
    this.manager.update(dt);
  }

  /** Eases the camera into `kind` over `duration` seconds, without waiting on a server message. */
  public transitionPose(kind: CameraPoseKind, duration: number, onCompleted?: () => void): void {
    const pose = this.createPose(kind);
    this.manager.transitionPose(pose, duration, () => {
      this.transitionCompleted.Fire(kind);
      onCompleted?.();
    });
  }

  /** @hidden */
  @OnClientMessage(Message.Camera_SetPose)
  public setCameraPose(poseKind: CameraPoseKind): void {
    const pose = this.createPose(poseKind);
    this.manager.setPose(pose);
  }

  /** @hidden */
  @OnClientMessage(Message.Camera_TransitionPose)
  public transitionCameraPose({ poseKind, duration }: MessageData[Message.Camera_TransitionPose]): void {
    this.transitionPose(poseKind, duration);
  }

  private createPose(kind: CameraPoseKind): BaseCameraPose {
    const cachedPose = this.cachedPoses[kind];
    if (cachedPose !== undefined)
      return cachedPose;

    switch (kind) {
      case CameraPoseKind.Character:
        return this.cachedPoses[kind] = new CharacterCameraPose(this);
      case CameraPoseKind.DuelPlanning:
        return this.cachedPoses[kind] = new DuelPlanningPose(this);
      case CameraPoseKind.DuelCastingOverview:
        return this.cachedPoses[kind] = new DuelCastingOverviewPose(this);
      case CameraPoseKind.DuelCasting:
        return this.cachedPoses[kind] = new DuelCastingPose(this);
    }
  }
}