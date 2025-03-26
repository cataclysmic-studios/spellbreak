import { RunService } from "@rbxts/services";

import { character } from "client/constants";
import { CameraPoseKind } from "shared/structs/camera";
import { BaseCameraPose } from "./base";

const OFFSET = new CFrame(0, 2.5, 10);

export class CharacterCameraPose extends BaseCameraPose {
  public readonly kind = CameraPoseKind.Character;

  public update(dt: number): void {
    this.camera.manager.setCFrame(this.getTargetCFrame());
  }

  public transitionInto(duration: number, onCompleted?: () => void): void {
    const startCFrame = this.camera.manager.getCFrame();
    const targetCFrame = this.getTargetCFrame();
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

  private getTargetCFrame(): CFrame {
    return character.getCFrame().mul(OFFSET);
  }
}