import { Controller, type OnStart } from "@flamework/core";
import { StarterGui } from "@rbxts/services";

import type { OnCharacterAdd } from "shared/hooks";
import { Events } from "client/network";

import { Movement } from "client/components/movement";
import type { CameraController } from "./camera";

@Controller()
export class InitializationController implements OnStart, OnCharacterAdd {
  public constructor(
    private readonly camera: CameraController
  ) { }

  public onStart(): void {
    task.delay(3, () => StarterGui.SetCore("ResetButtonCallback", false));
    Events.data.initialize();
    Events.general.addTag.connect((instancePath, tag) => {
      const instance = instancePath.split(".").reduce<Instance>((instance, instanceName) => instance.WaitForChild(instanceName), game);
      instance.AddTag(tag);
    });

    this.camera.set("Follow"); // set to preferred camera
  }

  public onCharacterAdd(character: CharacterModel): void {
    Movement.start(character); // remove if you don't want custom movement
  }
}