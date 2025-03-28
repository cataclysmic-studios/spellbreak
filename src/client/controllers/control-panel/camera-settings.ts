import { Controller } from "@flamework/core";
import Iris from "@rbxts/iris";

import { duelCameraHeight, duelCameraDistance } from "client/constants";
import { ControlPanelRenderable } from ".";
import type { ControlPanelInterfaceRenderer } from "shared/structs/control-panel";

@Controller()
@ControlPanelRenderable("Camera")
export class CameraSettingsController implements ControlPanelInterfaceRenderer {
  public renderControlPanelInterface(): void {
    const heightState = Iris.State(duelCameraHeight());
    Iris.SliderNum(["Duel Camera Height", 0.1, 0, 50], { number: heightState });
    const distanceState = Iris.State(duelCameraDistance());
    Iris.SliderNum(["Duel Camera Distance", 0.1, 0, 50], { number: distanceState });

    heightState.onChange(newHeight => duelCameraHeight(newHeight));
    distanceState.onChange(newDistance => duelCameraDistance(newDistance));
  }
}