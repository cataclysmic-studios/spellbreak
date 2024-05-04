import { Dependency, type OnRender } from "@flamework/core";
import { Component, type Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";

import { Player } from "shared/utility/client";
import { CameraControllerComponent } from "client/base-components/camera-controller-component";
import type { CameraController } from "client/controllers/camera";
import type { CharacterController } from "client/controllers/character";

interface Attributes {
  FollowCamera_Height: number;
  FollowCamera_Distance: number;
}

@Component({
  tag: "FollowCamera",
  defaults: {
    FollowCamera_Height: 8,
    FollowCamera_Distance: 8
  }
})
export class FollowCamera extends CameraControllerComponent<Attributes> implements OnRender {
  public static create(controller: CameraController): FollowCamera {
    const components = Dependency<Components>();
    const camera = World.CurrentCamera!.Clone();
    camera.CameraType = Enum.CameraType.Scriptable;
    camera.Name = "FollowCamera";
    camera.Parent = controller.cameraStorage;

    return components.addComponent(camera);
  }

  public constructor(
    private readonly character: CharacterController
  ) { super(); }

  public onRender(dt: number): void {
    const root = this.character.getRoot();
    if (root === undefined) return;

    const position = root.Position
      .add(new Vector3(0, this.getHeight(), 0))
      .sub(root.CFrame.LookVector.mul(this.getDistance()));

    this.setCFrame(CFrame.lookAt(position, root.Position));
  }

  public override toggle(on: boolean): void {
    super.toggle(on);
    Player.CameraMode = on ? Enum.CameraMode.Classic : Player.CameraMode;
  }

  private getDistance(): number {
    return this.attributes.FollowCamera_Distance;
  }

  private getHeight(): number {
    return this.attributes.FollowCamera_Height;
  }
}