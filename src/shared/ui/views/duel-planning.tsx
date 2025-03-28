import Vide, { type Source, Show, effect, source } from "@rbxts/vide";
import { Players } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import type { Timer } from "@rbxts/timer";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import type { ClientDuelInfo } from "shared/structs/duel";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { WizButton } from "../components/wiz-button";
import { DuelButton } from "../components/duel-button";
import { WizText } from "../components/wiz-text";

interface DuelPlanningProps {
  readonly duelInfo: ClientDuelInfo;
  readonly timer: Source<Timer>;
}

const STANDARD_TIMER_COLOR1 = Palette.brightYellow;
const STANDARD_TIMER_COLOR2 = Palette.deepYellow;
const RED_TIMER_COLOR1 = Palette.brightRed;
const RED_TIMER_COLOR2 = Palette.red;
const RED_TIMER_THRESHOLD = 10; // seconds left

const mouse = Players.LocalPlayer.GetMouse();

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ duelInfo, timer }: DuelPlanningProps): Vide.Node {
  const timerRemaining = source(timer().getTimeLeft());
  const redTimerText = () => timerRemaining() <= RED_TIMER_THRESHOLD;
  const px = usePx();

  const { deck, hand, choosing, selectedCard } = duelInfo.state;
  useEventListener(mouse.Button1Up, () => !choosing() ? choosing(true) : undefined);
  effect(() => {
    const currentTimer = timer();
    timerRemaining(currentTimer.getTimeLeft());
    useEventListener(currentTimer.secondReached, timerRemaining);
    useEventListener(currentTimer.completed, () => {
      timerRemaining(0);
      currentTimer.destroy();
    });
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
            redTimerText() ? RED_TIMER_COLOR1 : STANDARD_TIMER_COLOR1,
            redTimerText() ? RED_TIMER_COLOR2 : STANDARD_TIMER_COLOR2
          )}
        />
      </textlabel>
      <Show when={choosing}>
        {() => (
          <>
            <DeckHand duelInfo={duelInfo} />
            <DuelButton text="Pass"
              size={buttonSize}
              position={UDim2.fromScale(0.25, 0.85)}
              active={() => selectedCard() === undefined}
              activated={() => {
                choosing(false);
                deck.pass();
              }}
            />
            <DuelButton text="Draw"
              size={buttonSize}
              position={UDim2.fromScale(0.5, 0.85)}
              active={() => deck.canDrawSideboard(hand())}
              activated={() => {
                const treasureCard = deck.drawSideboard();
                const currentHand = hand();
                currentHand.unshift(treasureCard);
                hand(currentHand);
              }}
            />
            <DuelButton text="Flee"
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
                deck.revokeChoice();
              }}
            />
          </imagelabel>
        )}
      </Show>
    </Container>
  );
}