import Vide, { type Source, Show, source } from "@rbxts/vide";
import type { Timer } from "@rbxts/timer";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";


import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { WizButton } from "../components/wiz-button";
import { WizButton2 } from "../components/wiz-button2";
import { WizText } from "../components/wiz-text";
import { useEventListener } from "@rbxts/pretty-vide-utils";


interface DuelPlanningProps {
  readonly deckState: DeckDuelState;
  readonly timer: Timer;
  readonly hand: Source<SpellCard[]>;
}

const standardTimerColor1 = Palette.brightYellow;
const standardTimerColor2 = Palette.deepYellow;
const redTimerColor1 = Palette.brightRed;
const redTimerColor2 = Palette.red;
const redTimerThreshold = 10; // seconds left

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ deckState, timer, hand }: DuelPlanningProps): Vide.Node {
  const choosing = source(true);
  const selectedCard = source<Maybe<SpellCard>>();
  const timerRemaining = source(timer.getTimeLeft());
  const redTimer = () => timerRemaining() <= redTimerThreshold;
  const px = usePx();

  timer.start();
  useEventListener(timer.secondReached, seconds => timerRemaining(seconds));
  useEventListener(timer.completed, () => {
    timerRemaining(0);
    timer.destroy();
  });

  const buttonSize = UDim2.fromOffset(px(100), px(35));
  return (
    <Container name={$nameof(DuelPlanning)} size={UDim2.fromOffset(px(800), px(315))}>
      <textlabel Name="Timer"
        AnchorPoint={anchorPoints.topCenter}
        Position={positions.topCenter}
        BackgroundTransparency={1}
        Text={() => timerRemaining() === 0 ? "" : tostring(timerRemaining())}
        TextColor3={Palette.white}
        TextScaled={true}
        Size={UDim2.fromOffset(px(100), px(100))}
        FontFace={new Font("rbxassetid://12187364648", Enum.FontWeight.Bold)}
      >
        <uiaspectratioconstraint />
        <uistroke Thickness={px(2)} Transparency={0.4} />
        <uigradient
          Color={() => new ColorSequence(
            redTimer() ? redTimerColor1 : standardTimerColor1,
            redTimer() ? redTimerColor2 : standardTimerColor2
          )}
        />
      </textlabel>
      <Show when={choosing}>
        {() => (
          <>
            <DeckHand deckState={deckState} hand={hand} selectedCard={selectedCard} choosing={choosing} />
            <WizButton2 text="Pass"
              size={buttonSize}
              position={UDim2.fromScale(0.25, 0.85)}
              activated={() => choosing(false)}
              active={() => selectedCard() === undefined}
            />
            <WizButton2 text="Draw"
              size={buttonSize}
              position={UDim2.fromScale(0.5, 0.85)}
              active={() => deckState.canDrawSideboard()}
            />
            <WizButton2 text="Flee"
              size={buttonSize}
              position={UDim2.fromScale(0.75, 0.85)}
            />
          </>
        )}
      </Show>
      <Show when={() => !choosing()}>
        {() => (
          <imagelabel Name="WaitingForOthers"
            AnchorPoint={anchorPoints.center}
            Position={positions.center}
            Size={UDim2.fromOffset(px(300), px(90))}
            BackgroundTransparency={1}
            Image={Images.WaitingForOthersBG}
          >
            <uipadding
              PaddingTop={new UDim(0, px(18))}
              PaddingBottom={new UDim(0, px(23))}
            />
            <WizText text="Waiting for other players..."
              anchorPoint={anchorPoints.topCenter}
              position={positions.topCenter}
              size={UDim2.fromScale(1, 0.5)}
              textSize={px(18)}
              textColor={Palette.white}
            >
              <uistroke Thickness={px(1)} Transparency={0.3} />
            </WizText>
            <WizButton text="Change"
              anchorPoint={anchorPoints.bottomCenter}
              position={positions.bottomCenter}
              size={new UDim2(0, px(100), 0.5, 0)}
              textSize={px(16)}
              activated={() => {
                choosing(true);
                deckState.removeCardChoice();
              }}
            />
          </imagelabel>
        )}
      </Show>
    </Container>
  );
}