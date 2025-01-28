import { Workspace as World } from "@rbxts/services";

import { BaseCameraPose } from "client/camera-poses/base";
import { CharacterCameraPose } from "client/camera-poses/character";

export const enum CameraPoseType {
  Character,
  Battle,
  SpellCast,
  SpellAnimation
}

export class CameraManager {
  private readonly camera = World.CurrentCamera!;
  private pose?: BaseCameraPose = new CharacterCameraPose(this);

  public constructor() {
    this.camera.CameraType = Enum.CameraType.Scriptable;
  }

  /** @hidden */
  public update(dt: number): void {
    if (this.pose === undefined) return;
    this.pose.update(dt);
  }

  public transitionPose(newPose: BaseCameraPose, duration: number): void {
    this.pose = undefined;
    newPose.transitionInto(duration, () => this.pose = newPose);
  }

  public setCFrame(cframe: CFrame): void {
    this.camera.CFrame = cframe;
  }

  public getCFrame(): CFrame {
    return this.camera.CFrame;
  }
}