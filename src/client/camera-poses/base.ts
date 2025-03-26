import type { CameraPoseKind } from "shared/structs/camera";

import type { CameraController } from "client/controllers/camera";

export abstract class BaseCameraPose {
  public abstract readonly kind: CameraPoseKind;

  public constructor(
    protected readonly camera: CameraController
  ) { }

  public abstract update(dt: number): void;
  public abstract transitionInto(duration: number, onCompleted?: () => void): void;
}