import { Workspace as World } from "@rbxts/services";

import { BaseCameraPose } from "client/camera-poses/base";

export class CameraManager {
  private readonly camera = World.CurrentCamera!;
  private pose?: BaseCameraPose;

  public constructor() {
    this.camera.CameraType = Enum.CameraType.Scriptable;
  }

  /** @hidden */
  public update(dt: number): void {
    if (this.pose === undefined) return;
    this.pose.update(dt);
  }

  public transitionPose(newPose: BaseCameraPose, duration: number, onCompleted?: () => void): void {
    this.pose = undefined;
    newPose.transitionInto(duration, () => {
      this.pose = newPose;
      onCompleted?.();
    });
  }

  public setPose(newPose: BaseCameraPose): void {
    this.pose = newPose;
  }

  public setCFrame(cframe: CFrame): void {
    this.camera.CFrame = cframe;
  }

  public getCFrame(): CFrame {
    return this.camera.CFrame;
  }

  public setFOV(fov: number): void {
    this.camera.FieldOfView = fov;
  }

  public getFOV(): number {
    return this.camera.FieldOfView;
  }
}