import { Workspace as World } from "@rbxts/services";

import { BaseCameraPose } from "client/camera-poses/base";

export class CameraManager {
  private readonly camera = World.CurrentCamera!;
  private pose?: BaseCameraPose;
  private activeTransition?: RBXScriptConnection;

  public constructor() {
    this.camera.CameraType = Enum.CameraType.Scriptable;
  }

  /** @hidden */
  public update(dt: number): void {
    if (this.pose === undefined) return;
    this.pose.update(dt);
  }

  /**
   * Cancels any transition already in flight before starting the new one - otherwise a
   * transition requested before the previous one finishes (e.g. duel casting's overview -> focus
   * cut, which fires `duelCastingFocusDelay` after the overview transition starts but before its
   * `duelCameraTransitionDuration` elapses) leaves both transitions' render loops fighting over
   * the camera's CFrame, and the stale one's `onCompleted` later overwrites `pose` back to the
   * wrong value once it eventually runs out its clock.
   */
  public transitionPose(newPose: BaseCameraPose, duration: number, onCompleted?: () => void): void {
    this.activeTransition?.Disconnect();
    this.pose = undefined;
    this.activeTransition = newPose.transitionInto(duration, () => {
      this.activeTransition = undefined;
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