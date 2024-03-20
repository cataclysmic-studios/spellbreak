import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";

import type { LogStart } from "shared/hooks";
import { Player, PlayerGui } from "shared/utility/client";
import DestroyableComponent from "client/base-components/destroyable-component";
import Range from "shared/utility/range";

type CardFrame = (ImageLabel | ImageButton) & {
  UIScale: UIScale;
};

@Component({
  tag: "DeckHand",
  ancestorWhitelist: [ PlayerGui ]
})
export class DeckHand extends DestroyableComponent<{}, Frame & { UIListLayout: UIListLayout }> implements OnStart, LogStart {
  public onStart(): void {
    const screen = this.instance.FindFirstAncestorOfClass("ScreenGui")!;
    const mouse = Player.GetMouse();
    for (const card of this.getCards())
      new Instance("UIScale", card);

    this.janitor.Add(this.instance);
    this.janitor.Add(mouse.Move.Connect(() => {
      const { X, Y } = mouse;
      const framePosition = this.instance.AbsolutePosition;
      const frameSize = this.instance.AbsoluteSize;
      const frameDimensionsX = new Range(framePosition.X, framePosition.X + frameSize.X);
      const frameDimensionsY = new Range(framePosition.Y, framePosition.Y + frameSize.Y);
      if (frameDimensionsX.numberIsWithin(X) && frameDimensionsY.numberIsWithin(Y)) {
        for (const card of this.getCards())
          task.spawn(() => {
            const cardDistanceFromMouse = new Vector2(X, Y).sub(card.AbsolutePosition).Magnitude;
            const scaleIncrement = math.clamp(1 - (cardDistanceFromMouse / (screen.AbsoluteSize.Magnitude - frameSize.Magnitude) * 2), 0, 1);
            card.UIScale.Scale = 1 + scaleIncrement;
          });
        return;
      } else
        for (const card of this.getCards())
          card.UIScale.Scale = 1;
    }));
  }

  private getCards(): CardFrame[] {
    return this.instance.GetChildren()
      .filter((i): i is CardFrame => i.IsA("ImageLabel") || i.IsA("ImageButton"));
  }
}