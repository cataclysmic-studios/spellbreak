import Vide, { Show, effect, source } from "@rbxts/vide";
import { useEventListener, useLifetime } from "@rbxts/pretty-vide-utils";
import type { Timer } from "@rbxts/timer";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { Palette } from "../palette";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { SpellTargetKind } from "shared/structs/spell";
import type { SpellCard } from "shared/structs/spell-card";
import type { ClientDuelInfo, DuelCirclePosition } from "shared/structs/duel";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { WizButton } from "../components/wiz-button";
import { WizButton2 } from "../components/wiz-button2";
import { WizText } from "../components/wiz-text";
import { assets } from "shared/constants";
import { getDescendantsOfType } from "@rbxts/instance-utility";
import { Workspace as World } from "@rbxts/services";

interface DuelPlanningProps {
  readonly duelInfo: ClientDuelInfo;
  readonly timer: Timer;
}

const STANDARD_TIMER_COLOR1 = Palette.brightYellow;
const STANDARD_TIMER_COLOR2 = Palette.deepYellow;
const RED_TIMER_COLOR1 = Palette.brightRed;
const RED_TIMER_COLOR2 = Palette.red;
const RED_TIMER_THRESHOLD = 10; // seconds left

const SELECTION_AURA_HEIGHT = 7;
const OPPONENT_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(247, 64, 204),
  Color3.fromRGB(255, 56, 96),
  Color3.fromRGB(255, 196, 46),
  Color3.fromRGB(251, 255, 44)
];
const TEAM_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(154, 255, 21),
  Color3.fromRGB(10, 255, 182),
  Color3.fromRGB(82, 186, 255),
  Color3.fromRGB(137, 108, 255)
];

const selectionAuras: Model[] = [];
function createSelectionAura(duelInfo: ClientDuelInfo, targetsTeam: boolean, circlePosition: DuelCirclePosition): void {
  const selectionColors = targetsTeam
    ? TEAM_SELECTION_COLORS
    : OPPONENT_SELECTION_COLORS;

  const aura = assets.duel.selectionTarget.Clone();
  const positions = duelInfo.onOpposingTeam === targetsTeam
    ? duelInfo.model.teamPositions
    : duelInfo.model.opponentPositions;

  const positionPart = positions[tostring(circlePosition + 1) as never] as Part;
  const pivot = positionPart.GetPivot();
  const newPivot = pivot
    .sub(Vector3.yAxis.mul(positionPart.Size.Y / 2))
    .add(Vector3.yAxis.mul(SELECTION_AURA_HEIGHT / 2))
    .mul(CFrame.Angles(0, 0, math.rad(90)));

  aura.PivotTo(newPivot);
  aura.Parent = World.WaitForChild("TargetSelectionStorage");
  selectionAuras.push(aura);

  const color = selectionColors[circlePosition];
  for (const decal of getDescendantsOfType(aura, "Decal"))
    decal.Color3 = color;
}

function cleanupSelectionAuras(): void {
  selectionAuras.forEach(aura => aura.Destroy());
  selectionAuras.clear();
}

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ duelInfo, timer }: DuelPlanningProps): Vide.Node {
  const { state: { deck, hand, opponentCount, teamCount } } = duelInfo;
  const choosing = source(true);
  const selectedCard = source<Maybe<SpellCard>>();
  const timerRemaining = source(timer.getTimeLeft());
  const redTimer = () => timerRemaining() <= RED_TIMER_THRESHOLD;
  const px = usePx();

  timer.start();
  useEventListener(timer.secondReached, seconds => timerRemaining(seconds));
  useEventListener(timer.completed, () => {
    timerRemaining(0);
    timer.destroy();
  });

  effect(() => {
    const card = selectedCard();
    if (card === undefined || !card.spell.hasTarget)
      return cleanupSelectionAuras();

    if (selectionAuras.size() > 0)
      cleanupSelectionAuras();

    const targetsTeam = card.spell.targetKind === SpellTargetKind.SingleTeam;
    const targetCount = targetsTeam ? teamCount : opponentCount;
    for (const i of $range(1, targetCount))
      createSelectionAura(duelInfo, !targetsTeam, i - 1);
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
            redTimer() ? RED_TIMER_COLOR1 : STANDARD_TIMER_COLOR1,
            redTimer() ? RED_TIMER_COLOR2 : STANDARD_TIMER_COLOR2
          )}
        />
      </textlabel>
      <Show when={choosing}>
        {() => (
          <>
            <DeckHand deckState={deck} hand={hand} selectedCard={selectedCard} choosing={choosing} />
            <WizButton2 text="Pass"
              size={buttonSize}
              position={UDim2.fromScale(0.25, 0.85)}
              activated={() => choosing(false)}
              active={() => selectedCard() === undefined}
            />
            <WizButton2 text="Draw"
              size={buttonSize}
              position={UDim2.fromScale(0.5, 0.85)}
              active={() => deck.canDrawSideboard()}
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
                deck.removeCardChoice();
              }}
            />
          </imagelabel>
        )}
      </Show>
    </Container>
  );
}