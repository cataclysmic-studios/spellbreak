import { RunService } from "@rbxts/services";
import { $nameof } from "rbxts-transform-debug";

import { CameraPoseKind } from "shared/structs/camera";
import { BaseCameraPose } from "./base";
import Log from "shared/log";

import type { CameraController } from "client/controllers/camera";
import { DuelController } from "client/controllers/duel";

const CAMERA_HEIGHT = 18;
const CAMERA_DISTANCE_FROM_DUEL = 33;

const lerp = (a: number, b: number, t: number) => a + t * (b - a);

export class BattleAerialPose extends BaseCameraPose {
  public readonly kind = CameraPoseKind.BattleAerial;

  private duelCircleCameraCFrame?: CFrame;

  public constructor(
    camera: CameraController,
    private readonly duel: DuelController
  ) { super(camera); }

  public update(dt: number): void {
    const cframe = this.getCurrentDuelCircleCameraCFrame();
    if (cframe === undefined) return;
    this.camera.manager.setCFrame(cframe);
  }

  public transitionInto(duration: number, onCompleted?: () => void): void {
    if (this.duel.getCurrentInfo() === undefined)
      return Log.warn(`Attempt to transition into ${$nameof<BattleAerialPose>()} camera pose with no client duel info set`);

    const startCFrame = this.camera.manager.getCFrame();
    const targetCFrame = this.getCurrentDuelCircleCameraCFrame()!;
    const startTime = os.clock();

    const connection = RunService.RenderStepped.Connect(dt => {
      const progress = math.clamp((os.clock() - startTime) / duration, 0, 1);
      this.camera.manager.setCFrame(startCFrame.Lerp(targetCFrame, progress));

      if (progress >= 1) {
        connection.Disconnect();
        onCompleted?.();
      }
    });
  }

  private getCurrentDuelCircleCameraCFrame(): Maybe<CFrame> {
    const info = this.duel.getCurrentInfo();
    if (info === undefined || this.duelCircleCameraCFrame !== undefined)
      return this.duelCircleCameraCFrame;

    const root = info.model.Root;
    const circlePosition = root.Position;
    const position = circlePosition
      .add(new Vector3(0, CAMERA_HEIGHT, 0))
      .add(root.CFrame.LookVector.mul(CAMERA_DISTANCE_FROM_DUEL).mul(info.onOpposingTeam ? -1 : 1));

    return this.duelCircleCameraCFrame = CFrame.lookAt(position, circlePosition);
  }
}