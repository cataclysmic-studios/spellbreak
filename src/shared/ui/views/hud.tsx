import Vide, { Show, type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { getSelectedQuestInfo } from "shared/utility/quests";
import { getRequiredXpForNextLevel } from "shared/utility/character";
import type { DialogID } from "shared/structs/npc/dialog";
import type { Interactable } from "shared/structs/interactable";
import type { CharacterData } from "shared/structs/data";
import type { ActiveDuelState } from "shared/structs/duel";
import type { ZoneID } from "shared/structs/zone";

import { Container } from "../utility/components/container";
import { Dialog } from "../components/hud/dialog";
import { XpBar } from "../components/hud/xp-bar";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/hud/book-button";
import { QuestDescription } from "../components/quest/description";
import { QuestArrow } from "../components/quest/arrow";
import { InteractPrompt } from "../components/hud/interact-prompt";
import { DuelPlanning } from "./duel-planning";

export interface HudProps {
  readonly character: Source<CharacterData>
  readonly bookOpen: Source<boolean>;
  readonly bookPage: Source<BookPage>;
  readonly activeDialog: Source<Maybe<DialogID>>;
  readonly activeInteractable: Source<Maybe<Interactable>>;
  /** Set the instant a duel starts (camera easing into the planning pose) - drops the main HUD immediately, ahead of `activeDuel`/`planning` which wait for that transition to finish before showing cards. */
  readonly duelStarted: Source<boolean>;
  readonly activeDuel: Source<Maybe<ActiveDuelState>>;
  readonly currentZone: Source<Maybe<ZoneID>>;
}

const UDIM2_ZERO = new UDim2;
export function HUD({ character, bookOpen, bookPage, activeDialog, activeInteractable, duelStarted, activeDuel, currentZone }: HudProps): Vide.Node {
  const px = usePx();
  const questInfo = () => getSelectedQuestInfo(character());
  const hiddenByDialog = () => activeDialog() === undefined;
  const hiddenByDuel = () => !duelStarted();
  const mainUiVisible = () => hiddenByDialog() && hiddenByDuel();
  const showsWithQuest = () => mainUiVisible() && questInfo() !== undefined;
  const questHelperOffset = () => activeInteractable() !== undefined ? UDim2.fromOffset(0, -px(112)) : UDIM2_ZERO;
  const xpProgress = () => {
    const { xp, level } = character();
    return xp / getRequiredXpForNextLevel(level);
  };

  const horizontalPad = new UDim(0, px(10));
  return (
    <Container>
      {/* <uiaspectratioconstraint AspectRatio={4 / 3} /> */}
      <uipadding
        PaddingTop={new UDim(0, px(15))}
        PaddingBottom={new UDim(0, px(20))}
        PaddingLeft={horizontalPad}
        PaddingRight={horizontalPad}
      />
      <Dialog character={character} id={activeDialog} />
      <InteractPrompt interactable={activeInteractable} visible={() => activeInteractable() !== undefined && mainUiVisible()} />
      <QuestArrow info={questInfo} offset={questHelperOffset} visible={showsWithQuest} currentZone={currentZone}
        activated={() => {
          bookPage(BookPage.Quests);
          bookOpen(true);
        }}
      />
      <QuestDescription info={questInfo} offset={questHelperOffset} visible={showsWithQuest} />
      <XpBar progress={xpProgress} visible={mainUiVisible} />
      <BookButton isOpen={bookOpen} visible={mainUiVisible} />
      <Spellbook isOpen={bookOpen} character={character} page={bookPage} />
      <Show when={activeDuel}>
        {duel => (
          <Show when={duel().planning}>
            {() => <DuelPlanning duelInfo={duel().info} timer={duel().timer} />}
          </Show>
        )}
      </Show>
    </Container>
  );
}