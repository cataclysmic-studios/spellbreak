import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";
import type { CharacterController } from "client/controllers/character";
import { lerp } from "shared/utility/numbers";

interface Attributes {

}

@Component({
  tag: "BattleCamera",
  defaults: {

  }
})
export class BattleCamera extends CameraControllerComponent<Attributes> implements OnRender {
  private target = new CFrame;
  private targetFOV = this.instance.FieldOfView;
  private lerpSpeed = 0.4;

  public static create(controller: CameraController): BattleCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.Name = "BattleCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public onRender(dt: number): void {
    this.instance.FieldOfView = lerp(this.instance.FieldOfView, this.targetFOV, this.lerpSpeed * dt * 4);
    this.lerpCFrame(this.target, this.lerpSpeed * dt * 4);
  }

  public setTarget(target: CFrame): void {
    this.target = target;
  }

  public setTargetFOV(targetFOV: number): void {
    this.targetFOV = targetFOV;
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }
}