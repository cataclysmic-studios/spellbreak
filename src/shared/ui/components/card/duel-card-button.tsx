import Vide, { type Source, type Derivable, type PropsWithChildren, source, effect, cleanup, read, spring } from "@rbxts/vide";

import { anchorPoints, positions } from "../../utility/positioning";
import { cardAspectRatio, cardReferenceWidth, cardReferenceHeight } from "shared/constants";
import { spawnSelectionTargets } from "shared/utility/duel";
import type { SpellCard } from "shared/structs/spell/card";
import type { ClientDuelInfo, CommitDuelChoice } from "shared/structs/duel";
import Log from "shared/log";

import { Container } from "../../utility/components/container";
import { BaseCardButton } from "./base-card-button";

const log = Log.scoped("target selection");

interface DuelCardButtonProps {
  readonly spellCard: SpellCard;
  readonly layoutOrder: Derivable<number>;
  readonly duelInfo: ClientDuelInfo;
  readonly commitChoice: CommitDuelChoice;
  readonly grayscale?: Source<boolean>;
  /** Target hover-magnification multiplier on top of the card's normal fit-to-slot size (1 = no magnification). Eased internally via a spring so it never snaps. */
  readonly scale?: Derivable<number>;
}

const SCALE_SPRING_PERIOD = 0.055;
const SCALE_SPRING_DAMPING = 0.6;

export function DuelCardButton({
  spellCard, layoutOrder, grayscale, scale, duelInfo, commitChoice
}: PropsWithChildren<DuelCardButtonProps>): Vide.Node {
  const { model, onOpposingTeam, state: { hand, selectedCard, teamCount, opponentCount } } = duelInfo;
  // Derived off the hand-wide `selectedCard` rather than a per-instance `Source` - selecting
  // another card then naturally deselects this one through Vide's own reactivity instead of
  // needing every card to register a deselect callback somewhere to fan out to.
  const selected = () => selectedCard() === spellCard;
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
  const selectCard = () => selectedCard(spellCard);
  // Deferred - `rightClicked` is a native click callback this exact card instance owns, and
  // dropping it from `hand` immediately rebuilds `handCards` (in DeckHand) and destroys this
  // same instance's own component scope (disconnecting the very listener whose callback is
  // still executing). `task.defer` lets that callback frame finish and unwind first instead of
  // the component tearing itself down mid-callback.
  const discard = () => {
    if ("justDrawn" in spellCard && spellCard.justDrawn === true) return;
    task.defer(() => {
      if (selected()) selectedCard(undefined);
      const currentHand = hand();
      currentHand.remove(currentHand.indexOf(spellCard));
      hand(currentHand);
    });
  };

  effect(() => {
    if (!isGrayscale() || !selected()) return;
    selectedCard(undefined);
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

            // Deferred for the same reason as `discard` above: `commitChoice` flips `choosing`,
            // which unmounts this whole card's component tree via the `Show` in
            // duel-planning.tsx - running that teardown while this exact `leftClicked` callback's
            // frame is still on the stack is what hung Vide's reactive graph (script timeout) and
            // crashed Studio outright once the backlog of queued network packets that built up
            // during the hang overflowed the Lua stack in tether's relayer.
            task.defer(() => commitChoice(spellCard.spell.reference, undefined));
          }}
          rightClicked={discard}
        />
      </frame>
    </Container >
  );
}
