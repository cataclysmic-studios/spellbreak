import type { CameraPoseKind } from "shared/structs/camera";

import type { CameraController } from "client/controllers/camera";

export abstract class BaseCameraPose {
  public abstract readonly kind: CameraPoseKind;

  public constructor(
    protected readonly camera: CameraController
  ) { }

  public abstract update(dt: number): void;
  /** Returns the connection driving the transition, so a subsequent transition can cancel it if it starts before this one finishes - `undefined` if the transition never actually started. */
  public abstract transitionInto(duration: number, onCompleted?: () => void): Maybe<RBXScriptConnection>;
}