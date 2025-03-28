import { RunService } from "@rbxts/services";
import { $nameof } from "rbxts-transform-debug";

import { CameraPoseKind } from "shared/structs/camera";
import { BaseCameraPose } from "./base";
import { duelCameraDistance, duelCameraHeight } from "client/constants";
import Log from "shared/log";

import type { CameraController } from "client/controllers/camera";
import type { DuelController } from "client/controllers/duel";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FOV = 55;

export class DuelCastingPose extends BaseCameraPose {
  public readonly kind = CameraPoseKind.DuelCasting;

  private duelCircleCameraCFrame?: CFrame;

  public constructor(
    camera: CameraController,
    private readonly duel: DuelController
  ) { super(camera); }

  public update(dt: number): void {
    const cframe = this.getCurrentDuelCircleCameraCFrame();
    if (cframe === undefined) return;
    this.camera.manager.setCFrame(cframe);
    this.camera.manager.setFOV(FOV);
  }

  public transitionInto(duration: number, onCompleted?: () => void): void {
    if (this.duel.getCurrentInfo() === undefined)
      return Log.warn(`Attempt to transition into ${$nameof<DuelCastingPose>()} camera pose with no client duel info set`);

    const startCFrame = this.camera.manager.getCFrame();
    const startFOV = this.camera.manager.getFOV();
    const targetCFrame = this.getCurrentDuelCircleCameraCFrame()!;
    const startTime = os.clock();

    const connection = RunService.RenderStepped.Connect(dt => {
      const progress = math.clamp((os.clock() - startTime) / duration, 0, 1);
      this.camera.manager.setCFrame(startCFrame.Lerp(targetCFrame, progress));
      this.camera.manager.setFOV(lerp(startFOV, FOV, progress));

      if (progress >= 1) {
        connection.Disconnect();
        onCompleted?.();
      }
    });
  }

  private getCurrentDuelCircleCameraCFrame(): Maybe<CFrame> {
    const info = this.duel.getCurrentInfo();
    if (info === undefined) // || this.duelCircleCameraCFrame !== undefined
      return this.duelCircleCameraCFrame;

    const root = info.model.Root;
    const circlePosition = root.Position;
    const direction = root.CFrame.LookVector.sub(root.CFrame.RightVector.mul(1.75)).Unit;
    const position = circlePosition
      .add(new Vector3(0, duelCameraHeight(), 0))
      .add(direction.mul(duelCameraDistance()).mul(info.onOpposingTeam ? -1 : 1));

    return this.duelCircleCameraCFrame = CFrame.lookAt(position, circlePosition);
  }
}