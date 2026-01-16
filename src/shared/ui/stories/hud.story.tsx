import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { newCharacterData } from "shared/utility/character";
import { School } from "shared/structs/school";
import { HUD, type HudProps } from "../views/hud";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";
import "../dev";

const characterData: Writable<CharacterData> = newCharacterData("Mock", School.Myth);
characterData.xp += 54;

const mockHudState: HudProps = {
  character: source(characterData),
  bookOpen: source(false),
  activeDialog: source<Maybe<DialogID>>(undefined)
};

export = hoarcekat(() => <HUD {...mockHudState} />);