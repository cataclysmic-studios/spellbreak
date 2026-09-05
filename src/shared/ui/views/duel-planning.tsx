import Vide, { type Source, Show, effect, source } from "@rbxts/vide";
import { useEventListener } from "@rbxts/pretty-vide-utils";
import type { Timer } from "@rbxts/timer";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { palette } from "../palette";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { messaging, Message } from "shared/messaging";
import { maxCardsInHand } from "shared/constants";
import type { ClientDuelInfo } from "shared/structs/duel";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { DuelButton } from "../components/duel-button";
import { WizButton } from "../components/wiz-button";
import { WizText } from "../components/wiz-text";

interface DuelPlanningProps {
  readonly duelInfo: ClientDuelInfo;
  readonly timer: Source<Timer>;
}

const STANDARD_TIMER_COLOR1 = palette.brightYellow;
const STANDARD_TIMER_COLOR2 = palette.deepYellow;
const RED_TIMER_COLOR1 = palette.brightRed;
const RED_TIMER_COLOR2 = palette.red;
const RED_TIMER_THRESHOLD = 10; // seconds left

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ duelInfo, timer }: DuelPlanningProps): Vide.Node {
  const timerRemaining = source(timer().getTimeLeft());
  const redTimerText = () => timerRemaining() <= RED_TIMER_THRESHOLD;
  const px = usePx();

  const { hand, sideboardCount, choosing, selectedCard, chosenSpellReference, chosenTarget } = duelInfo.state;
  // Passing counts as a choice too - the moment `choosing` drops, whatever the player decided
  // (pass, a no-target spell, or a spell+target) has already been locked into
  // `chosenSpellReference`/`chosenTarget` (both `undefined` for a pass) by the card/pass button
  // that flipped `choosing`, so just forward it, drop the played card from hand, and reset both
  // for next round.
  effect(() => {
    if (choosing()) return;

    const spellReference = chosenSpellReference();
    const target = chosenTarget();
    messaging.server.emit(Message.Duel_ChoiceMade, {
      id: duelInfo.id,
      spellReference,
      target: target?.position,
      targetIsOpponent: target?.isOpponent
    });

    if (spellReference !== undefined) {
      const currentHand = hand();
      const playedIndex = currentHand.findIndex(card => card.spell.reference === spellReference);
      if (playedIndex !== -1) currentHand.remove(playedIndex);
      hand(currentHand);
    }

    chosenSpellReference(undefined);
    chosenTarget(undefined);
  });
  effect(() => {
    const currentTimer = timer();
    timerRemaining(currentTimer.getTimeLeft());
    useEventListener(currentTimer.secondReached, timerRemaining);
    useEventListener(currentTimer.completed, () => {
      timerRemaining(0);
      currentTimer.destroy();
      // Auto-pass whoever hasn't locked in yet - drops `choosing`, which the effect
      // above turns into a Duel_ChoiceMade, the same path the Pass button uses.
      choosing(false);
    });
  });

  const buttonSize = UDim2.fromOffset(px(110), px(35));
  return (
    <Container name={$nameof(DuelPlanning)} size={UDim2.fromOffset(px(800), px(315))}>
      <textlabel Name="Timer"
        AnchorPoint={anchorPoints.topCenter}
        Position={positions.topCenter}
        BackgroundTransparency={1}
        Text={() => timerRemaining() === 0 ? "" : tostring(timerRemaining())}
        TextColor3={palette.white}
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
        {() => <>
          <DeckHand duelInfo={duelInfo} />
          <DuelButton text="Pass"
            size={buttonSize}
            position={UDim2.fromScale(0.25, 0.85)}
            active={() => selectedCard() === undefined}
            activated={() => {
              choosing(false);
              // deck.pass();
            }}
          />
          <DuelButton text="Draw"
            size={buttonSize}
            position={UDim2.fromScale(0.5, 0.85)}
            active={() => hand().size() < maxCardsInHand && sideboardCount() > 0}
            activated={() => messaging.server.emit(Message.Duel_DrawSideboard, duelInfo.id)}
          />
          <DuelButton text="Flee"
            size={buttonSize}
            position={UDim2.fromScale(0.75, 0.85)}
          />
        </>}
      </Show>
      <Show when={() => !choosing()}>
        {() => (
          <imagelabel Name="WaitingForOthers"
            AnchorPoint={anchorPoints.center}
            Position={positions.center}
            Size={UDim2.fromOffset(px(300), px(90))}
            BackgroundTransparency={1}
            Image={Images.Background_WaitingForOthers}
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
              textColor={palette.white}
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
                // deck.revokeChoice();
              }}
            />
          </imagelabel>
        )}
      </Show>
    </Container>
  );
}