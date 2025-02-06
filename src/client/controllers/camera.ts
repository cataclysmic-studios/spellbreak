import { Controller, type OnRender } from "@flamework/core";

import { CameraManager } from "client/classes/camera-manager";

@Controller()
export class CameraController implements OnRender {
  public readonly manager = new CameraManager;

  public onRender(dt: number): void {
    this.manager.update(dt);
  }
}