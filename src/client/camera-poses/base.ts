import { CameraManager } from "client/classes/camera-manager";

export abstract class BaseCameraPose {
  public constructor(
    protected readonly camera: CameraManager
  ) { }

  public abstract update(dt: number): void;
  public abstract transitionInto(duration: number, onCompleted?: () => void): void;
}