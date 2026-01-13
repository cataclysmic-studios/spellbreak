import Vide, { Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import type { DialogID } from "shared/structs/npc/dialog";

import { Container } from "../utility/components/container";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/spellbook/book-button";
import { Dialog } from "../components/dialog";

export interface HudProps {
  readonly bookOpen: Source<boolean>;
  readonly activeDialog: Source<Maybe<DialogID>>;
}

export function HUD({ bookOpen, activeDialog }: HudProps): Vide.Node {
  const hiddenByDialog = () => activeDialog() === undefined;
  const px = usePx();

  return (
    <Container>
      {/* <uiaspectratioconstraint AspectRatio={4 / 3} /> */}
      <uipadding
        PaddingTop={new UDim(0, px(15))}
        PaddingBottom={new UDim(0, px(20))}
        PaddingLeft={new UDim(0, px(10))}
        PaddingRight={new UDim(0, px(10))}
      />
      <Dialog id={activeDialog} />
      <BookButton visible={hiddenByDialog} isOpen={bookOpen} />
      <Spellbook
        page={BookPage.Options}
        isOpen={bookOpen}
      />
    </Container>
  );
}