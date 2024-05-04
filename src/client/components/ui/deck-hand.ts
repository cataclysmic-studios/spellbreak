import type { OnStart } from "@flamework/core";
import { Component, type Components } from "@flamework/components";

import type { LogStart } from "shared/hooks";
import type { Spell } from "shared/structs/spell";
import { Player, PlayerGui } from "shared/utility/client";
import { Range } from "shared/utility/range";
import { randomIndex } from "shared/utility/array";
import DestroyableComponent from "shared/base-components/destroyable";

import type SpellHelper from "shared/helpers/spell";
import type { CardButton } from "./card-button";
import type { BattleController } from "client/controllers/battle";

type CardFrame = (ImageLabel | ImageButton) & {
  UIScale: UIScale;
};

const MAX_CARDS_IN_HAND = 7;

// TODO: add cards from deck to hand

@Component({
  tag: "DeckHand",
  ancestorWhitelist: [PlayerGui]
})
export class DeckHand extends DestroyableComponent<{}, Frame & { UIListLayout: UIListLayout }> implements OnStart, LogStart {
  private readonly mouse = Player.GetMouse();
  private readonly screen = this.instance.FindFirstAncestorOfClass("ScreenGui")!;
  private cardsRemaining: string[] = [];
  private treasureCardsRemaining: string[] = [];
  private cardsInHand = 0;

  public constructor(
    private readonly components: Components,
    private readonly battle: BattleController,
    private readonly spellHelper: SpellHelper
  ) { super(); }

  public onStart(): void {
    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.mouse.Move.Connect(() => this.updateCardHoverStatus()));
    this.janitor.Add(this.battle.turnStarted.Connect(() => {
      this.draw();
      this.screen.Enabled = true;
    }));
    this.janitor.Add(this.battle.entered.Connect(() => {
      const battleClient = this.battle.getClient();
      if (battleClient === undefined) return;
      this.cardsRemaining = battleClient.deck?.spells ?? [];
      this.treasureCardsRemaining = battleClient.deck?.sideboardSpells ?? [];
    }));
  }

  public draw(): void {
    const battleClient = this.battle.getClient();
    if (battleClient === undefined) return;
    this.drawFrom(this.cardsRemaining);
  }

  public drawFromSideboard(): void {
    const battleClient = this.battle.getClient();
    if (battleClient === undefined) return;
    this.drawFrom(this.treasureCardsRemaining);
  }

  private drawFrom(cards: string[]): void {
    const cardsToDraw = MAX_CARDS_IN_HAND - this.cardsInHand;
    if (cardsToDraw === 0) return;

    for (let i = 0; i < cardsToDraw; i++) {
      const cardIndex = randomIndex(cards);
      if (cardIndex === -1) break;

      const spell = this.spellHelper.mustGetFromReference(cards[cardIndex]);
      this.addCard(spell, cards === this.treasureCardsRemaining);
      cards.remove(cardIndex);
    }
  }

  private addCard({ name, cardImage, greyscaleCardImage, school }: Spell, treasure = false): void {
    task.spawn(() => {
      const cardButton = new Instance("ImageButton", this.instance);
      cardButton.SetAttribute("CardButton_Name", name);
      cardButton.SetAttribute("CardButton_School", school);
      cardButton.SetAttribute("CardButton_TreasureCard", treasure);

      const card = this.components.addComponent<CardButton>(cardButton);
      cardButton.Name = name;
      cardButton.Image = card.canCast() ? cardImage : greyscaleCardImage;
      cardButton.AutoButtonColor = false;
      cardButton.BackgroundTransparency = 1;
      cardButton.AnchorPoint = new Vector2(1, 1);
      cardButton.Size = UDim2.fromScale(1, 1);

      const scale = new Instance("UIScale", cardButton);
      scale.Scale = 1;

      const ratioConstraint = new Instance("UIAspectRatioConstraint", cardButton);
      ratioConstraint.AspectRatio = 0.652;
    });
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