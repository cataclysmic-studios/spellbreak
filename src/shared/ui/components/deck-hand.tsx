import Vide, { For, source, cleanup, effect, untrack } from "@rbxts/vide";
import { Range } from "@rbxts/range";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import { $nameof } from "rbxts-transform-debug";
import { Players } from "@rbxts/services";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";
import { positions } from "../utility/positioning";
import { maxCardsInHand } from "shared/constants";
import Log from "shared/log";

import { Container } from "../utility/components/container";
import { CardBackground } from "./card/card-background";
import { DuelCardButton, type CardButtonFrame } from "./card/duel-card-button";
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
  const px = usePx();

  let screen: ScreenGui;
  const cardFrames = source<CardButtonFrame[]>([]);
  useEventListener(mouse.Move, () => {
    const { X, Y } = mouse;
    const position = absolutePosition();
    const size = absoluteSize();
    const dimensionsX = new Range(position.X, position.X + size.X);
    const dimensionsY = new Range(position.Y, position.Y + size.Y);
    if (!dimensionsX.isNumberWithin(X) || !dimensionsY.isNumberWithin(Y)) {
      for (const card of cardFrames())
        card.CardScale.Scale = 1;

      return;
    }

    for (const card of cardFrames()) {
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

  effect(() => {
    cleanup(() => cardFrames([]));
    const currentHand = hand();
    for (const [i, card] of pairs(currentHand)) {
      if (i >= maxCardsInHand)
        return Log.warn(`Not adding card button for spell '${card.spell.name}' - hand has too many cards (${currentHand.size()}, maximum ${maxCardsInHand})`);

      const cardFrame = <DuelCardButton spellCard={card}
        layoutOrder={i}
        duelInfo={duelInfo}
      />;

      cleanup(cardFrame as Instance);
      const frames = untrack(cardFrames);
      frames.push(cardFrame as CardButtonFrame);
      untrack(() => cardFrames(frames));
    }
  });

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
      <CardBackground image={Images.CardInfoBG} layoutOrder={-1}>
        <WizText text={() => `Cards\n${deck.getCardsLeft()} of ${deck.totalCards}`}
          position={positions.center}
          font={Enum.Font.Cartoon}
          size={UDim2.fromScale(1, 0.5)}
          textSize={px(16)}
        />
      </CardBackground>
      <For each={cardFrames}>
        {card => card}
      </For>
    </Container>
  );
}