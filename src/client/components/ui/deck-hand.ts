import type { OnStart } from "@flamework/core";
import { Component, type Components } from "@flamework/components";

import type { LogStart } from "shared/hooks";
import type { Spell } from "shared/structs/spell";
import { Player, PlayerGui } from "shared/utility/client";
import DestroyableComponent from "shared/base-components/destroyable-component";
import Range from "shared/utility/range";

import type { CardButton } from "./card-button";

type CardFrame = (ImageLabel | ImageButton) & {
  UIScale: UIScale;
};

const MAX_CARDS_IN_HAND = 7;

@Component({
  tag: "DeckHand",
  ancestorWhitelist: [ PlayerGui ]
})
export class DeckHand extends DestroyableComponent<{}, Frame & { UIListLayout: UIListLayout }> implements OnStart, LogStart {
  private readonly mouse = Player.GetMouse();
  private readonly screen = this.instance.FindFirstAncestorOfClass("ScreenGui")!;

  public constructor(
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
    this.janitor.Add(this.instance);
    this.janitor.Add(this.mouse.Move.Connect(() => this.updateCardHoverStatus()));
  }

  public addCard({ name, cardImage }: Spell): CardButton {
    const cardButton = new Instance("ImageButton", this.instance);
    cardButton.Name = name;
    cardButton.Image = cardImage;
    cardButton.AutoButtonColor = false;
    cardButton.BackgroundTransparency = 1;
    cardButton.AnchorPoint = new Vector2(1, 1);
    cardButton.Size = UDim2.fromScale(1, 1);

    const scale = new Instance("UIScale", cardButton);
    scale.Scale = 1;

    const ratioConstraint = new Instance("UIAspectRatioConstraint", cardButton);
    ratioConstraint.AspectRatio = 0.652;

    return this.components.addComponent<CardButton>(cardButton);
  }

  private updateCardHoverStatus(): void {
    if (!this.screen.Enabled) return;

    const { X, Y } = this.mouse;
    const framePosition = this.instance.AbsolutePosition;
    const frameSize = this.instance.AbsoluteSize;
    const frameDimensionsX = new Range(framePosition.X, framePosition.X + frameSize.X);
    const frameDimensionsY = new Range(framePosition.Y, framePosition.Y + frameSize.Y);
    if (!(frameDimensionsX.numberIsWithin(X) && frameDimensionsY.numberIsWithin(Y))) {
      for (const card of this.getCards())
        task.spawn(() => card.UIScale.Scale = 1);
      return;
    }

    for (const card of this.getCards())
      task.spawn(() => {
        const cardPosition = card.AbsolutePosition;
        const cardSize = card.AbsoluteSize;
        const cardDistanceFromMouseVector = new Vector2(X, Y).sub(cardPosition.add(new Vector2(cardSize.X / 2, 0)));
        const cardDistanceFromMouse = (cardDistanceFromMouseVector.sub(new Vector2(0, cardDistanceFromMouseVector.Y))).Magnitude;
        const scaleIncrement = math.clamp(1 - (cardDistanceFromMouse / (this.screen.AbsoluteSize.Magnitude - frameSize.Magnitude) * 2), 0, 1);
        card.UIScale.Scale = 1 + this.modifyScaleIncrement(scaleIncrement);
      });
  }

  private getCards(): CardFrame[] {
    return this.instance.GetChildren()
      .filter((i): i is CardFrame => i.IsA("ImageButton"));
  }

  private modifyScaleIncrement(scaleIncrement: number): number {
    return scaleIncrement ** 3 * 0.75;
  }
}