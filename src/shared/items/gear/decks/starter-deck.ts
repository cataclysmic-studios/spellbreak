import { GearCategory } from "shared/structs/data/items/gear";
import { DeckData } from "shared/structs/data/items/gear/deck";
import { DeckReference } from "shared/structs/data/reference/gear/deck";

export = {
  name: "Starter Deck",
  category: GearCategory.Deck,
  reference: DeckReference.StarterDeck,
  maxSpells: 8,
  maxSideboardSpells: 4,
  maxCopies: 3,
  maxSchoolCopies: 3,
  sockets: [],
  noAuction: false,
  noTrade: false,
  pvpOnly: false,
  noPvp: false
} satisfies DeckData;