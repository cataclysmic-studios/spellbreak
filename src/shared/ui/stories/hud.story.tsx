import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { newCharacterData } from "shared/utility/character";
import { School } from "shared/structs/school";
import { HUD, type HudProps } from "../views/hud";
import { BookPage } from "../components/spellbook";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";
import type { Interactable } from "shared/structs/interactable";
import type { ActiveDuelState } from "shared/structs/duel";
import type { ZoneID } from "shared/structs/zone";
import "../dev";

const characterData: Writable<CharacterData> = newCharacterData("Mock", School.Myth);
characterData.xp += 54;

const mockHudState: HudProps = {
  player: source({ crowns: 0, characters: [characterData] }),
  character: source(characterData),
  bookOpen: source(false),
  bookPage: source<BookPage>(BookPage.Options),
  activeDialog: source<Maybe<DialogID>>(undefined),
  activeInteractable: source<Maybe<Interactable>>(undefined),
  duelStarted: source(false),
  activeDuel: source<Maybe<ActiveDuelState>>(undefined),
  currentZone: source<Maybe<ZoneID>>(undefined)
};

export = hoarcekat(() => <HUD {...mockHudState} />);