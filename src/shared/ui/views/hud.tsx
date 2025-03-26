import Vide, { source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";

import { Container } from "../utility/components/container";
import { Spellbook, BookPage } from "../components/spellbook";
import { BookButton } from "../components/spellbook/book-button";

export function HUD(): Vide.Node {
  const bookIsOpen = source(false);
  const px = usePx();

  return <Container>
    {/* <uiaspectratioconstraint AspectRatio={4 / 3} /> */}
    <uipadding
      PaddingTop={new UDim(0, px(15))}
      PaddingBottom={new UDim(0, px(20))}
      PaddingLeft={new UDim(0, px(10))}
      PaddingRight={new UDim(0, px(10))}
    />
    <BookButton isOpen={bookIsOpen} />
    <Spellbook
      page={BookPage.Options}
      isOpen={bookIsOpen}
    />
  </Container>;
}