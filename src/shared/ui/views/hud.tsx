import Vide, { Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";

import { Container } from "../utility/components/container";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/spellbook/book-button";
import { Dialog } from "../components/dialog";
import { XpBar } from "../components/xp-bar";
import { getRequiredXpForNextLevel } from "shared/utility/character";

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
      <XpBar progress={xpProgress} />
      <BookButton visible={hiddenByDialog} isOpen={bookOpen} />
      <Spellbook
        page={BookPage.Options}
        isOpen={bookOpen}
      />
    </Container>
  );
}