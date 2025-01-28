import { Controller, type OnRender } from "@flamework/core";
import { CameraManager } from "client/classes/camera-manager";

@Controller()
export class CameraController implements OnRender {
  private readonly camera = new CameraManager;

  public onRender(dt: number): void {
    this.camera.update(dt);
  }
}