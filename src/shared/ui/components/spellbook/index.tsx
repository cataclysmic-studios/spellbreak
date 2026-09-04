import Vide, { type Source, type Derivable, source, read, Switch, Case } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";
import { Images } from "../../utility/images";
import type { CharacterData } from "shared/structs/data";

import { Container } from "../../utility/components/container";
import { CharacterPage } from "./pages/character-page";
import { BackpackPage } from "./pages/backpack-page";
import { PetsPage } from "./pages/pets-page";
import { DeckPage } from "./pages/deck-page";
import { QuestsPage } from "./pages/quests-page";
import { MapPage } from "./pages/map-page";
import { CraftingPage } from "./pages/crafting-page";
import { HelpPage } from "./pages/help-page";
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
  Help,
  Options
}

export interface PageProps {
  readonly character: Source<CharacterData>;
}

interface BookProps {
  readonly isOpen: Source<boolean>;
  readonly character: Source<CharacterData>;
  readonly page?: Source<BookPage>;
  readonly onlyOptions?: Derivable<boolean>;
}

export function Spellbook({ isOpen, character, page, onlyOptions = false }: BookProps): Vide.Node {
  const selectedPage = page ?? source<BookPage>(BookPage.Options);
  const nonOptionsActive = () => read(onlyOptions) === false;
  const px = usePx();

  return (
    <Container name="Spellbook"
      anchorPoint={anchorPoints.center}
      position={positions.center}
      size={UDim2.fromOffset(px(750), px(600))}
      visible={isOpen}
    >
      <Container name="SideButtons"
        anchorPoint={anchorPoints.rightCenter}
        position={positions.rightCenter.add(UDim2.fromScale(0.005, 0.02))}
        size={UDim2.fromScale(0.1, 1)}
        zIndex={2}
      >
        <uilistlayout
          FillDirection="Vertical"
          HorizontalAlignment="Center"
          VerticalAlignment="Top"
          SortOrder="LayoutOrder"
          Padding={new UDim(0.013, 0)}
        />
        <BookSideButton icon={Images.Button_Book_CharacterStats} active={nonOptionsActive} activated={() => selectedPage(BookPage.Character)} />
        <BookSideButton icon={Images.Button_Book_Backpack} active={nonOptionsActive} activated={() => selectedPage(BookPage.Backpack)} />
        <BookSideButton icon={Images.Button_Book_Pets} active={nonOptionsActive} activated={() => selectedPage(BookPage.Pets)} />
        <BookSideButton icon={Images.Button_Book_Deck} active={nonOptionsActive} activated={() => selectedPage(BookPage.Deck)} />
        <BookSideButton icon={Images.Button_Book_Quests} active={nonOptionsActive} activated={() => selectedPage(BookPage.Quests)} />
        <BookSideButton icon={Images.Button_Book_Map} active={nonOptionsActive} activated={() => selectedPage(BookPage.Map)} />
        <BookSideButton icon={Images.Button_Book_Crafting} active={nonOptionsActive} activated={() => selectedPage(BookPage.Crafting)} />
        <BookSideButton icon={Images.Button_Book_Options} activated={() => selectedPage(BookPage.Options)} />
        <BookSideButton icon={Images.Button_Book_Help} activated={() => selectedPage(BookPage.Help)} />
        <BookSideButton icon={Images.Button_Book_Exit} iconSize={80} activated={() => isOpen(false)} />
      </Container>
      <imagelabel
        AnchorPoint={anchorPoints.center}
        Position={positions.center}
        Size={UDim2.fromScale(1, 1)}
        BackgroundTransparency={1}
        Image={Images.Background_BookPages}
      >
        <Switch condition={selectedPage}>
          <Case match={BookPage.Quests}>{() => <QuestsPage character={character} />}</Case>
          <Case match={BookPage.Character}>{() => <CharacterPage character={character} />}</Case>
          <Case match={BookPage.Backpack}>{() => <BackpackPage character={character} />}</Case>
          <Case match={BookPage.Pets}>{() => <PetsPage character={character} />}</Case>
          <Case match={BookPage.Deck}>{() => <DeckPage character={character} />}</Case>
          <Case match={BookPage.Map}>{MapPage}</Case>
          <Case match={BookPage.Crafting}>{() => <CraftingPage character={character} />}</Case>
          <Case match={BookPage.Help}>{HelpPage}</Case>
          <Case match={BookPage.Options}>{OptionsPage}</Case>
        </Switch>
      </imagelabel>
      <uicorner CornerRadius={new UDim(0, px(4))} />
    </Container>
  );
}