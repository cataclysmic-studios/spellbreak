import Vide, { Show, type Source, type Derivable, source, read } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";
import { Images } from "../../utility/images";

import { Container } from "../../utility/components/container";
import { CharacterPage } from "./pages/character-page";
import { BackpackPage } from "./pages/backpack-page";
import { PetsPage } from "./pages/pets-page";
import { DeckPage } from "./pages/deck-page";
import { QuestsPage } from "./pages/quests-page";
import { MapPage } from "./pages/map-page";
import { CraftingPage } from "./pages/crafting-page";
import { OptionsPage } from "./pages/options-page";
import { BookSideButton } from "./book-side-button";

export const enum BookPage {
  Character,
  Backpack,
  Pets,
  Deck,
  Quests,
  Map,
  Crafting,
  Options
}

const bookPages: Record<BookPage, () => Vide.Node> = {
  [BookPage.Character]: CharacterPage,
  [BookPage.Backpack]: BackpackPage,
  [BookPage.Pets]: PetsPage,
  [BookPage.Deck]: DeckPage,
  [BookPage.Quests]: QuestsPage,
  [BookPage.Map]: MapPage,
  [BookPage.Crafting]: CraftingPage,
  [BookPage.Options]: OptionsPage
}

interface BookProps {
  readonly page?: Derivable<BookPage>;
  readonly onlyOptions?: Derivable<boolean>;
  readonly isOpen: Source<boolean>;
}

export function Spellbook({ page, isOpen, onlyOptions }: BookProps): Vide.Node {
  const selectedPage = source(read(page) ?? BookPage.Options);
  const px = usePx();
  const onlyEnableOptions = onlyOptions ?? false;

  const CurrentPage = bookPages[selectedPage()];
  return <Show when={isOpen}>
    {() => (
      <Container name={$nameof(Spellbook)}
        anchorPoint={anchorPoints.center}
        position={positions.center}
        size={UDim2.fromOffset(px(800), px(600))}
      >
        <imagelabel Name="LeatherBinding"
          AnchorPoint={anchorPoints.center}
          Position={positions.center}
          Size={UDim2.fromScale(1, 1)}
          BackgroundTransparency={1}
          Image={Images.BookBinding}
        >
          <Container name="SideButtons"
            anchorPoint={anchorPoints.rightCenter}
            position={positions.rightCenter.add(UDim2.fromScale(0.04, 0))}
            size={UDim2.fromScale(0.1, 1)}
          >
            <uilistlayout
              FillDirection={Enum.FillDirection.Vertical}
              HorizontalAlignment={Enum.HorizontalAlignment.Center}
              VerticalAlignment={Enum.VerticalAlignment.Center}
              SortOrder={Enum.SortOrder.LayoutOrder}
              Padding={new UDim(0, px(10))}
            />
            <BookSideButton icon={Images.CharStatsButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Character)} />
            <BookSideButton icon={Images.BackpackButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Backpack)} />
            <BookSideButton icon={Images.PetsButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Pets)} />
            <BookSideButton icon={Images.DeckButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Deck)} />
            <BookSideButton icon={Images.QuestsButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Quests)} />
            <BookSideButton icon={Images.MapButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Map)} />
            <BookSideButton icon={Images.CraftingButton} active={!onlyEnableOptions} activated={() => selectedPage(BookPage.Crafting)} />
            <BookSideButton icon={Images.OptionsButton} activated={() => selectedPage(BookPage.Options)} />
            <BookSideButton icon={Images.ExitButton} iconSize={80} activated={() => isOpen(false)} />
          </Container>
          <imagelabel
            AnchorPoint={anchorPoints.center}
            Position={positions.center}
            Size={UDim2.fromScale(0.9, 0.92)}
          >
            <CurrentPage />
          </imagelabel>
          <uicorner CornerRadius={new UDim(0, px(4))} />
        </imagelabel>
      </Container>
    )}
  </Show>
}