import { Controller } from "@flamework/core";

import { ControlPanelRenderable } from ".";
import { ControlPanelInterfaceRenderer } from "shared/structs/control-panel";
import type { MovementController } from "../movement";
import Iris from "@rbxts/iris";

@Controller()
@ControlPanelRenderable("Movement")
export class MovementSettingsController implements ControlPanelInterfaceRenderer {
  public constructor(
    private readonly movement: MovementController
  ) { }

  public renderControlPanelInterface(): void {
    const walkSpeedState = Iris.State(this.movement.walkSpeed);
    Iris.SliderNum(["Walk Speed", 0.1, 0, 50], { number: walkSpeedState });
    const turnSpeedState = Iris.State(this.movement.turnSpeed);
    Iris.SliderNum(["Turn Speed", 0.1, 0, 16], { number: turnSpeedState });

    walkSpeedState.onChange(walkSpeed => this.movement.walkSpeed = walkSpeed);
    turnSpeedState.onChange(turnSpeed => this.movement.turnSpeed = turnSpeed);
  }
}