import { Controller, type OnStart } from "@flamework/core";
import { StarterGui } from "@rbxts/services";

import { Events } from "client/network";

@Controller()
export class InitializationController implements OnStart {
  public onStart(): void {
    Events.data.initialize();
    StarterGui.SetCore("ResetButtonCallback", false);
  }
}