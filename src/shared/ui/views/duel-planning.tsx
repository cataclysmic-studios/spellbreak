import Vide, { type Source, Show, source } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { WizButton2 } from "../components/wiz-button2";
import { Images } from "../utility/images";
import { anchorPoints, positions } from "../utility/positioning";
import { WizButton } from "../components/wiz-button";
import { WizText } from "../components/wiz-text";
import { Palette } from "../palette";


interface DuelPlanningProps {
  readonly deckState: DeckDuelState;
  readonly hand: Source<SpellCard[]>;
}

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ deckState, hand }: DuelPlanningProps): Vide.Node {
  const choosing = source(true);
  const hasCardSelected = source(false);
  const px = usePx();

  const buttonSize = UDim2.fromOffset(px(100), px(35));
  return (
    <Container name={$nameof(DuelPlanning)} size={UDim2.fromOffset(px(800), px(315))}>
      <textlabel Name="Timer"
        AnchorPoint={anchorPoints.topCenter}
        Position={positions.topCenter}
        BackgroundTransparency={1}
        Text="30"
        TextColor3={Palette.white}
        TextScaled={true}
        Size={UDim2.fromOffset(px(100), px(100))}
        FontFace={new Font("rbxassetid://12187364648", Enum.FontWeight.Bold)}
      >
        <uiaspectratioconstraint />
        <uigradient Color={new ColorSequence(Palette.brightYellow, Palette.deepYellow)} />
        <uistroke Thickness={px(2)} Transparency={0.4} />
      </textlabel>
      <Show when={choosing}>
        {() => (
          <>
            <DeckHand deckState={deckState} hand={hand} hasCardSelected={hasCardSelected} />
            <WizButton2 text="Pass"
              size={buttonSize}
              position={UDim2.fromScale(0.25, 0.85)}
              activated={() => choosing(false)}
              active={() => !hasCardSelected()}
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
              activated={() => choosing(true)}
            />
          </imagelabel>
        )}
      </Show>
    </Container>
  );
}