import Vide, { type Source, type Derivable, type PropsWithChildren, source, effect, read } from "@rbxts/vide";
import { Players, Workspace as World } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";

import { usePx } from "../../hooks/use-px";
import { palette } from "../../palette";
import type { SpellCard } from "shared/structs/spell/card";
import type { ClientDuelInfo, DuelCirclePosition } from "shared/structs/duel";

import { Container } from "../../utility/components/container";
import { BaseCardButton } from "./base-card-button";

interface DuelCardButtonProps {
  readonly spellCard: SpellCard;
  readonly layoutOrder: Derivable<number>;
  readonly duelInfo: ClientDuelInfo;
  readonly grayscale?: Source<boolean>;
}

const mouse = Players.LocalPlayer.GetMouse();
const deselectFunctions: (() => void)[] = [];

export interface CardButtonFrame extends Frame {
  CardScale: UIScale;
}

export function DuelCardButton({
  spellCard, layoutOrder, grayscale,
  duelInfo: { state: { hand, selectedCard, choosing } }
}: PropsWithChildren<DuelCardButtonProps>): Vide.Node {
  const selected = source(false);
  const hovered = source(false);
  const isGrayscale = () => read(grayscale) ?? false;

  const deselectAll = () => {
    deselectFunctions.forEach(fn => fn());
    selectedCard(undefined);
  };

  const deselectCard = () => selected(false);
  const selectCard = () => {
    deselectAll();
    selected(true);
    selectedCard(spellCard);
  };
  const discard = () => {
    if ("justDrawn" in spellCard && spellCard.justDrawn === true) return;
    deselectAll();
    const currentHand = hand();
    currentHand.remove(currentHand.indexOf(spellCard));
    hand(currentHand);
  };

  deselectFunctions.push(deselectCard);
  useEventListener(mouse.Button1Up, () => {
    const card = selectedCard();
    if (card === undefined) return;

    const unitRay = World.CurrentCamera!.ScreenPointToRay(mouse.X, mouse.Y);
    const raycastParams = new RaycastParams;
    raycastParams.FilterType = Enum.RaycastFilterType.Include;
    raycastParams.FilterDescendantsInstances = [World.TargetSelectionStorage];

    const result = World.Raycast(unitRay.Origin, unitRay.Direction.mul(200), raycastParams);
    if (result === undefined)
      return deselectAll();

    const auraModel = result.Instance.FindFirstAncestorOfClass("Model")!;
    const position = auraModel.GetAttribute<DuelCirclePosition>("DuelCirclePosition")!;
    const isOpponent = auraModel.GetAttribute<boolean>("OpposingTeam")!;
    deselectAll();
    choosing(false);
    // deck.chooseCard(card, position, isOpponent);
  });
  effect(() => {
    if (!isGrayscale()) return;
    deselectCard();
  });

  const px = usePx();
  return (
    <Container name={spellCard.spell.name + "Card"} clipsDescendants={true}>
      <uistroke
        Color={palette.white}
        Thickness={px(1.8)}
        Transparency={() => selected() ? 0.1 : 1}
      />
      <uiscale Name="CardScale" />
      <BaseCardButton spellCard={spellCard}
        layoutOrder={layoutOrder}
        grayscale={isGrayscale}
        hovered={() => hovered(true)}
        unhovered={() => hovered(false)}
        leftClicked={() => {
          if (isGrayscale()) return;
          if (spellCard.spell.hasTarget)
            return selectCard();

          deselectAll();
          choosing(false);
          // deck.chooseCard(spellCard);
        }}
        rightClicked={discard}
      />
    </Container >
  );
}