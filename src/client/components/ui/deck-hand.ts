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
    for (const card of this.getCards()) {
      const scale = new Instance("UIScale", card);
      scale.Scale = 1;
    }

    this.janitor.Add(this.instance);
    this.janitor.Add(mouse.Move.Connect(() => {
      const { X, Y } = mouse;
      const framePosition = this.instance.AbsolutePosition;
      const frameSize = this.instance.AbsoluteSize;
      const frameDimensionsX = new Range(framePosition.X, framePosition.X + frameSize.X);
      const frameDimensionsY = new Range(framePosition.Y, framePosition.Y + frameSize.Y);
      if (!(frameDimensionsX.numberIsWithin(X) && frameDimensionsY.numberIsWithin(Y))) {
        for (const card of this.getCards())
          card.UIScale.Scale = 1;
        return;
      }

      for (const card of this.getCards())
        task.spawn(() => {
          const cardPosition = card.AbsolutePosition;
          const cardSize = card.AbsoluteSize;
          const cardDistanceFromMouseVector = new Vector2(X, Y).sub(cardPosition.add(new Vector2(cardSize.X / 2, 0)));
          const cardDistanceFromMouse = (cardDistanceFromMouseVector.sub(new Vector2(0, cardDistanceFromMouseVector.Y))).Magnitude;
          const scaleIncrement = math.clamp(1 - (cardDistanceFromMouse / (screen.AbsoluteSize.Magnitude - frameSize.Magnitude) * 2), 0, 1);
          card.UIScale.Scale = 1 + this.modifyScaleIncrement(scaleIncrement);
        });
    }));
  }

  private getCards(): CardFrame[] {
    return this.instance.GetChildren()
      .filter((i): i is CardFrame => i.IsA("ImageButton"));
  }

  private modifyScaleIncrement(scaleIncrement: number): number {
    return scaleIncrement ** 3 * 0.75;
  }
}