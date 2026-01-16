import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { getRequiredXpForNextLevel } from "shared/utility/character";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";

import { Container } from "../utility/components/container";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/spellbook/book-button";
import { Dialog } from "../components/dialog";
import { XpBar } from "../components/xp-bar";
import { QuestDescription, type QuestInfo } from "../components/quest-description";

export interface HudProps {
  readonly character: Source<CharacterData>
  readonly bookOpen: Source<boolean>;
  readonly activeDialog: Source<Maybe<DialogID>>;
}

export function HUD({ character, bookOpen, activeDialog }: HudProps): Vide.Node {
  const px = usePx();
  const hiddenByDialog = () => activeDialog() === undefined;
  const xpProgress = () => {
    const { xp, level } = character();
    return xp / getRequiredXpForNextLevel(level);
  };
  const questInfo = (): Maybe<QuestInfo> => {
    const { selectedQuest, activeQuests } = character();
    if (selectedQuest === undefined) return;

    const goalIndex = activeQuests[selectedQuest];
    if (goalIndex === undefined) return;

    return { questID: selectedQuest, goalIndex };
  };

  return (
    <Container>
      {/* <uiaspectratioconstraint AspectRatio={4 / 3} /> */}
      <uipadding
        PaddingTop={new UDim(0, px(15))}
        PaddingBottom={new UDim(0, px(20))}
        PaddingLeft={new UDim(0, px(10))}
        PaddingRight={new UDim(0, px(10))}
      />
      <Dialog character={character} id={activeDialog} />
      <QuestDescription info={questInfo} visible={() => hiddenByDialog() && questInfo() !== undefined} />
      <XpBar progress={xpProgress} visible={hiddenByDialog} />
      <BookButton isOpen={bookOpen} visible={hiddenByDialog} />
      <Spellbook
        page={BookPage.Options}
        isOpen={bookOpen}
      />
    </Container>
  );
}