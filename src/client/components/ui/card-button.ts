import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";

import { Player, PlayerGui } from "shared/utility/client";
import DestroyableComponent from "client/base-components/destroyable-component";
import Range from "shared/utility/range";

@Component({
  tag: "CardButton",
  ancestorWhitelist: [ PlayerGui ]
})
export class CardButton extends DestroyableComponent<{}, ImageButton> implements OnStart {
  public constructor(
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
    const mouse = Player.GetMouse();
    this.janitor.Add(mouse.Button1Down.Connect(() => {
      const { X, Y } = mouse;
      const position = this.instance.AbsolutePosition;
      const size = this.instance.AbsoluteSize;
      const dimensionsX = new Range(position.X, position.X + size.X);
      const dimensionsY = new Range(position.Y, position.Y + size.Y);

      if (dimensionsX.numberIsWithin(X) && dimensionsY.numberIsWithin(Y)) return;
      this.deselectOthers();
    }));

    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => {
      this.deselectOthers();

      for (const otherCard of this.components.getAllComponents<CardButton>()) {
        if (otherCard !== this) continue;
        const selectionBorder = new Instance("UIStroke", this.instance);
        selectionBorder.Thickness = 1.6;
        selectionBorder.Transparency = 0.2;
        selectionBorder.Color = new Color3(1, 1, 1);
        selectionBorder.LineJoinMode = Enum.LineJoinMode.Round;
        selectionBorder.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;
      }
    }));
  }

  private deselectOthers(): void {
    for (const otherCard of this.components.getAllComponents<CardButton>())
      if (otherCard !== this)
        otherCard.instance.FindFirstChildOfClass("UIStroke")?.Destroy();
  }
}