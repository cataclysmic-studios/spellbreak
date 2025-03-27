import Vide from "@rbxts/vide";

import { BattlePlanning } from "../views/battle-planning";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import Troll from "shared/spells/myth/troll";
import { SpellCardKind, SpellCard } from "shared/structs/spell-card";

const testCards: SpellCard[] = [
  {
    kind: SpellCardKind.Normal,
    spell: Troll
  }, {
    kind: SpellCardKind.Normal,
    spell: Troll
  }
];
export = hoarcekat(() => <BattlePlanning hand={() => testCards} />);