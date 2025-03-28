import { Controller, type OnRender } from "@flamework/core";

import { OnMessage } from "client/decorators";
import { Message, type MessageData } from "shared/messaging";
import { CameraManager } from "client/classes/camera-manager";
import { CameraPoseKind } from "shared/structs/camera";

import { BaseCameraPose } from "client/camera-poses/base";
import { CharacterCameraPose } from "client/camera-poses/character";
import { DuelPlanningPose } from "client/camera-poses/duel-planning";
import { DuelCastingPose } from "client/camera-poses/duel-casting";
import type { DuelController } from "./duel";

@Controller()
export class CameraController implements OnRender {
  public readonly manager = new CameraManager;

  private readonly cachedPoses: Partial<Record<CameraPoseKind, BaseCameraPose>> = {};

  public constructor(
    private readonly duel: DuelController
  ) {
    this.manager.setPose(this.createPose(CameraPoseKind.Character));
  }

  public onRender(dt: number): void {
    this.manager.update(dt);
  }

  /** @hidden */
  @OnMessage(Message.SetCameraPose)
  public setCameraPose(poseKind: CameraPoseKind): void {
    const pose = this.createPose(poseKind);
    this.manager.setPose(pose);
  }

  /** @hidden */
  @OnMessage(Message.TransitionCameraPose)
  public transitionCameraPose({ poseKind, duration }: MessageData[Message.TransitionCameraPose]): void {
    const pose = this.createPose(poseKind);
    this.manager.transitionPose(pose, duration);
  }

  public createPose(kind: CameraPoseKind): BaseCameraPose {
    const cachedPose = this.cachedPoses[kind];
    if (cachedPose !== undefined)
      return cachedPose;

    switch (kind) {
      case CameraPoseKind.Character:
        return this.cachedPoses[kind] = new CharacterCameraPose(this);
      case CameraPoseKind.DuelPlanning:
        return this.cachedPoses[kind] = new DuelPlanningPose(this, this.duel);
      case CameraPoseKind.DuelCasting:
        return this.cachedPoses[kind] = new DuelCastingPose(this, this.duel);
    }
  }
}