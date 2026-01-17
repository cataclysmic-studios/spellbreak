import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { getSelectedQuestInfo } from "shared/utility/quests";
import { getRequiredXpForNextLevel } from "shared/utility/character";
import type { DialogID } from "shared/structs/npc/dialog";
import type { Interactable } from "shared/structs/interactable";
import type { CharacterData } from "shared/structs/data";

import { Container } from "../utility/components/container";
import { Dialog } from "../components/dialog";
import { XpBar } from "../components/xp-bar";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/spellbook/book-button";
import { QuestDescription } from "../components/quest/description";
import { QuestArrow } from "../components/quest/arrow";
import { InteractPrompt } from "../components/interact-prompt";

export interface HudProps {
  readonly character: Source<CharacterData>
  readonly bookOpen: Source<boolean>;
  readonly activeDialog: Source<Maybe<DialogID>>;
  readonly activeInteractable: Source<Maybe<Interactable>>;
}

const UDIM2_ZERO = new UDim2;
export function HUD({ character, bookOpen, activeDialog, activeInteractable }: HudProps): Vide.Node {
  const px = usePx();
  const questInfo = () => getSelectedQuestInfo(character());
  const hiddenByDialog = () => activeDialog() === undefined;
  const showsWithQuest = () => hiddenByDialog() && questInfo() !== undefined;
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
      <InteractPrompt interactable={activeInteractable} visible={() => activeInteractable() !== undefined && hiddenByDialog()} />
      <QuestArrow info={questInfo} offset={questHelperOffset} visible={showsWithQuest} />
      <QuestDescription info={questInfo} offset={questHelperOffset} visible={showsWithQuest} />
      <XpBar progress={xpProgress} visible={hiddenByDialog} />
      <BookButton isOpen={bookOpen} visible={hiddenByDialog} />
      <Spellbook page={BookPage.Options} isOpen={bookOpen} />
    </Container>
  );
}