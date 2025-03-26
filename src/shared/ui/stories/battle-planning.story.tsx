import Vide from "@rbxts/vide";

import { BattlePlanning } from "../views/battle-planning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import Troll from "shared/spells/myth/troll";
import { CardKind, SpellCard } from "shared/structs/spell-card";

const cards: SpellCard[] = [
  {
    cardKind: CardKind.Normal,
    spell: Troll
  }
];
export = hoarcekat(() => <BattlePlanning hand={() => cards} />);