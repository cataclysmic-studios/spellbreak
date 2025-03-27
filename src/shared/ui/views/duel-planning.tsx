import Vide, { type Source, Show, source } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import { DeckDuelState } from "shared/classes/deck-duel-state";
import type { SpellCard } from "shared/structs/spell-card";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";
import { WizButton2 } from "../components/wiz-button2";


interface DuelPlanningProps {
  readonly deckState: DeckDuelState;
  readonly hand: Source<SpellCard[]>;
}

/** View for passing, choosing cards, drawing cards, etc. */
export function DuelPlanning({ deckState, hand }: DuelPlanningProps): Vide.Node {
  const choosing = source(true);
  const px = usePx();

  const buttonSize = UDim2.fromOffset(px(100), px(35));
  return (
    <Container name={$nameof(DuelPlanning)} size={UDim2.fromOffset(px(800), px(215))}>
      <Show when={choosing}>
        {() => (
          <>
            <DeckHand deckState={deckState} hand={hand} />
            <WizButton2 text="Pass"
              size={buttonSize}
              position={UDim2.fromScale(0.25, 1)}
              activated={() => choosing(false)}
            />
            <WizButton2 text="Draw"
              size={buttonSize}
              position={UDim2.fromScale(0.5, 1)}
              active={() => deckState.canDrawSideboard()}
            />
            <WizButton2 text="Flee"
              size={buttonSize}
              position={UDim2.fromScale(0.75, 1)}
            />
          </>
        )}
      </Show>
      <Show when={() => !choosing()}>
        {() => { }}
      </Show>
    </Container>
  );
}