import { RunService } from "@rbxts/services";

import { currentDuel } from "client/state/duel";
import { BaseCameraPose } from "./base";
import Log from "shared/log";

import type { CameraController } from "client/controllers/camera";
import type { ClientDuelInfo } from "shared/structs/duel";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Shared vantage point (this player's corner of the duel circle) for every duel camera pose - only the look target and FOV differ between them. */
export abstract class DuelCircleFacingPose extends BaseCameraPose {
  protected abstract readonly fov: number;

  private duelCircleCameraCFrame?: CFrame;

  public constructor(
    camera: CameraController,
  ) { super(camera); }

  public update(dt: number): void {
    const cframe = this.getDuelCircleCameraCFrame();
    if (cframe === undefined) return;
    this.camera.manager.setCFrame(cframe);
    this.camera.manager.setFOV(this.fov);
  }

  public transitionInto(duration: number, onCompleted?: () => void): void {
    if (currentDuel() === undefined) {
      Log.warn("Attempt to transition into a duel camera pose with no client duel info set");
      return;
    }

    const startCFrame = this.camera.manager.getCFrame();
    const startFOV = this.camera.manager.getFOV();
    const targetCFrame = this.getDuelCircleCameraCFrame()!;
    const startTime = os.clock();

    const connection = RunService.RenderStepped.Connect(dt => {
      const progress = math.clamp((os.clock() - startTime) / duration, 0, 1);
      this.camera.manager.setCFrame(startCFrame.Lerp(targetCFrame, progress));
      this.camera.manager.setFOV(lerp(startFOV, this.fov, progress));

      if (progress >= 1) {
        connection.Disconnect();
        onCompleted?.();
      }
    });
  }

  protected abstract getLookTarget(info: ClientDuelInfo): Vector3;

  private getDuelCircleCameraCFrame(): Maybe<CFrame> {
    const info = currentDuel();
    if (info === undefined)
      return this.duelCircleCameraCFrame;

    const root = info.model.Root;
    const position = this.getPosition(root.CFrame, info.onOpposingTeam);

    return this.duelCircleCameraCFrame = CFrame.lookAt(position, this.getLookTarget(info));
  }

  private getPosition(circleCFrame: CFrame, onOpposingTeam: boolean): Vector3 {
    return circleCFrame.Position
      .add(new Vector3(0, this.camera.duelCameraHeight(), 0))
      .add(circleCFrame.LookVector.mul(this.camera.duelCameraDistance()).mul(onOpposingTeam ? -1 : 1));
  }
}
