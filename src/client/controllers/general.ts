import { Controller, type OnStart } from "@flamework/core";
import { StarterGui } from "@rbxts/services";

import type { LogStart } from "shared/hooks";
import { Events } from "client/network";

@Controller()
export class GeneralController implements LogStart, OnStart {
  public onStart(): void {
    Events.data.initialize();
    Events.general.addTag.connect((instancePath, tag) => {
      const instance = instancePath.split(".").reduce<Instance>((instance, instanceName) => instance.WaitForChild(instanceName), game);
      instance.AddTag(tag);
    });
    task.delay(3, () => StarterGui.SetCore("ResetButtonCallback", false));
  }
}