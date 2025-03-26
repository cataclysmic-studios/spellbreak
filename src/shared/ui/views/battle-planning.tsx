import Vide, { type Source, Show, source } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../hooks/use-px";
import type { SpellCard } from "shared/structs/spell-card";

import { Container } from "../utility/components/container";
import { DeckHand } from "../components/deck-hand";


interface BattlePlanningProps {
  readonly hand: Source<SpellCard[]>;
}

/** View for passing, choosing cards, drawing cards, etc. */
export function BattlePlanning({ hand }: BattlePlanningProps): Vide.Node {
  const choiceMade = source(false);
  const px = usePx();

  return <Container name={$nameof(BattlePlanning)} size={UDim2.fromOffset(px(800), px(200))}>
    <Show when={() => !choiceMade()}>
      {() => <DeckHand hand={hand} />}
    </Show>
  </Container>;
}