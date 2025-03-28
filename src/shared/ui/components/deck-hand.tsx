import Vide, { type Source, For, source } from "@rbxts/vide";
import { Range } from "@rbxts/range";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import { $nameof } from "rbxts-transform-debug";
import { Players } from "@rbxts/services";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";
import { positions } from "../utility/positioning";
import { ClientDuelDeckState } from "shared/classes/client-deck-duel-state";
import { maxCardsInHand } from "shared/constants";
import type { SpellCard } from "shared/structs/spell-card";
import Log from "shared/log";

import { Container } from "../utility/components/container";
import { BaseCardButton } from "./base-card-button";
import { CardButton, type CardButtonFrame } from "./card-button";
import { WizText } from "./wiz-text";
import { ClientDuelInfo } from "shared/structs/duel";

interface DeckHandProps {
  readonly duelInfo: ClientDuelInfo;
}

const mouse = Players.LocalPlayer.GetMouse();

export function DeckHand({ duelInfo }: DeckHandProps): Vide.Node {
  const { state: { deck, hand } } = duelInfo
  const absolutePosition = source(Vector2.zero);
  const absoluteSize = source(Vector2.zero);
  const cardFrames: CardButtonFrame[] = [];
  const px = usePx();

  let screen: ScreenGui;
  useEventListener(mouse.Move, () => {
    const { X, Y } = mouse;
    const position = absolutePosition();
    const size = absoluteSize();
    const dimensionsX = new Range(position.X, position.X + size.X);
    const dimensionsY = new Range(position.Y, position.Y + size.Y);
    if (!dimensionsX.isNumberWithin(X) || !dimensionsY.isNumberWithin(Y)) {
      for (const card of cardFrames)
        card.CardScale.Scale = 1;

      return;
    }

    for (const card of cardFrames) {
      if (screen === undefined)
        screen = card.FindFirstAncestorOfClass("ScreenGui")!;

      if (screen === undefined) continue;
      const cardPosition = card.AbsolutePosition
      const cardSize = card.AbsoluteSize;
      const cardDistanceFromMouseVector = new Vector2(X, Y).sub(cardPosition.add(new Vector2(cardSize.X / 2, 0)));
      const cardDistanceFromMouse = (cardDistanceFromMouseVector.sub(new Vector2(0, cardDistanceFromMouseVector.Y))).Magnitude;
      const scaleIncrement = math.clamp(1 - (cardDistanceFromMouse / (screen.AbsoluteSize.Magnitude - size.Magnitude) * 3), 0, 1);
      card.CardScale.Scale = 1 + (scaleIncrement ** 3 * 0.75);
    }
  })

  return (
    <Container name={$nameof(DeckHand)}
      size={UDim2.fromOffset(px(800), px(100))}
      position={positions.center}
      absolutePositionChanged={absolutePosition}
      absoluteSizeChanged={absoluteSize}
    >
      <uilistlayout
        Padding={new UDim(0, px(5))}
        FillDirection={Enum.FillDirection.Horizontal}
        HorizontalAlignment={Enum.HorizontalAlignment.Center}
        VerticalAlignment={Enum.VerticalAlignment.Center}
        SortOrder={Enum.SortOrder.LayoutOrder}
      />
      <BaseCardButton image={Images.CardInfoBG} layoutOrder={-1}>
        <WizText text={() => `Cards\n${deck.getCardsLeft()} of ${deck.totalCards}`}
          position={positions.center}
          font={Enum.Font.Cartoon}
          size={UDim2.fromScale(1, 0.5)}
          textSize={px(16)}
        />
      </BaseCardButton>
      <For each={hand}>
        {(card, index) => {
          if (index() >= maxCardsInHand)
            return Log.warn(`Not adding card button for spell '${card.spell.name}' - hand has to many cards (${index() + 1}, maximum ${maxCardsInHand})`);

          // this gives me cancer
          const cardFrame = <CardButton
            layoutOrder={index}
            spellCard={card}
            duelInfo={duelInfo}
          />;
          cardFrames.push(cardFrame as CardButtonFrame);

          return cardFrame;
        }}
      </For>
    </Container>
  );
}