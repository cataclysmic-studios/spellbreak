import Vide, { type Source, type Derivable, type PropsWithChildren, source, effect, cleanup, read, spring } from "@rbxts/vide";
import { Players, Workspace as World } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";

import { anchorPoints, positions } from "../../utility/positioning";
import { cardAspectRatio, cardReferenceWidth, cardReferenceHeight } from "shared/constants";
import { spawnSelectionTargets } from "shared/utility/duel";
import type { SpellCard } from "shared/structs/spell/card";
import type { ClientDuelInfo, DuelCirclePosition } from "shared/structs/duel";
import Log from "shared/log";

import { Container } from "../../utility/components/container";
import { BaseCardButton } from "./base-card-button";

const log = Log.scoped("target selection");

interface DuelCardButtonProps {
  readonly spellCard: SpellCard;
  readonly layoutOrder: Derivable<number>;
  readonly duelInfo: ClientDuelInfo;
  readonly grayscale?: Source<boolean>;
  /** Target hover-magnification multiplier on top of the card's normal fit-to-slot size (1 = no magnification). Eased internally via a spring so it never snaps. */
  readonly scale?: Derivable<number>;
}

const mouse = Players.LocalPlayer.GetMouse();
const deselectFunctions: (() => void)[] = [];

const SCALE_SPRING_PERIOD = 0.055;
const SCALE_SPRING_DAMPING = 0.6;

export function DuelCardButton({
  spellCard, layoutOrder, grayscale, scale, duelInfo
}: PropsWithChildren<DuelCardButtonProps>): Vide.Node {
  const { model, onOpposingTeam, state: { hand, selectedCard, choosing, chosenSpellReference, chosenTarget, teamCount, opponentCount } } = duelInfo;
  const selected = source(false);
  const hovered = source(false);
  const isGrayscale = () => read(grayscale) ?? false;
  const containerAbsoluteSize = source(new Vector2(cardReferenceWidth, cardReferenceHeight));
  const hoverTarget = () => read(scale) ?? 1;
  const [smoothHoverScale] = spring(hoverTarget, SCALE_SPRING_PERIOD, SCALE_SPRING_DAMPING);
  // The hover magnification lives on the Container's own Size (below), not just this UIScale,
  // so UIListLayout sees the card actually grow and pushes its neighbors out of the way instead
  // of letting them overlap - this just fits the fixed-reference-size content to whatever pixel
  // size that resizing Container ends up at.
  const finalScale = () => containerAbsoluteSize().X / cardReferenceWidth;
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
    raycastParams.IncludeInstances = [World.TargetSelectionStorage];

    const result = World.Raycast(unitRay.Origin, unitRay.Direction.mul(200), raycastParams);
    if (result === undefined) {
      log.info(`click: raycast against ${World.TargetSelectionStorage.GetFullName()} hit nothing - deselecting`);
      return deselectAll();
    }

    const auraModel = result.Instance.FindFirstAncestorOfClass("Model")!;
    const position = auraModel.GetAttribute<DuelCirclePosition>("DuelCirclePosition")!;
    const isOpponent = auraModel.GetAttribute<boolean>("OpposingTeam")!;
    log.info(`click: hit ${result.Instance.GetFullName()} -> aura ${auraModel.Name} (position=${position}, isOpponent=${isOpponent})`);
    deselectAll();
    chosenSpellReference(card.spell.reference);
    chosenTarget({ position, isOpponent });
    choosing(false);
  });
  effect(() => {
    if (!isGrayscale()) return;
    deselectCard();
  });
  effect(() => {
    if (!selected()) return;
    if (!spellCard.spell.hasTarget) {
      log.warn(`"${spellCard.spell.name}" was selected but has no target - not spawning selection auras`);
      return;
    }

    log.info(`"${spellCard.spell.name}" selected (targetKind=${spellCard.spell.targetKind}) - spawning selection auras`);
    const auras: Model[] = [];
    spawnSelectionTargets(
      model, onOpposingTeam, spellCard.spell.targetKind, teamCount, opponentCount,
      aura => auras.push(aura)
    );
    cleanup(() => {
      log.debug(`"${spellCard.spell.name}" deselected - destroying ${auras.size()} aura(s)`);
      auras.forEach(aura => aura.Destroy());
    });
  });

  return (
    <Container name={spellCard.spell.name + "Card"}
      size={() => UDim2.fromScale(smoothHoverScale(), smoothHoverScale())}
      absoluteSizeChanged={containerAbsoluteSize}
    >
      <uiaspectratioconstraint AspectRatio={cardAspectRatio} />
      <frame Name="ScaleRoot" AnchorPoint={anchorPoints.center} Position={positions.center} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
        <uiscale Name="CardScale" Scale={finalScale} />
        <BaseCardButton spellCard={spellCard}
          layoutOrder={layoutOrder}
          grayscale={isGrayscale}
          selected={selected}
          hovered={() => hovered(true)}
          unhovered={() => hovered(false)}
          leftClicked={() => {
            if (isGrayscale()) return;
            if (spellCard.spell.hasTarget)
              return selectCard();

            deselectAll();
            chosenSpellReference(spellCard.spell.reference);
            chosenTarget(undefined);
            choosing(false);
          }}
          rightClicked={discard}
        />
      </frame>
    </Container >
  );
}