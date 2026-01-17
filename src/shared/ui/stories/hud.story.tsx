import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { newCharacterData } from "shared/utility/character";
import { School } from "shared/structs/school";
import { HUD, type HudProps } from "../views/hud";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";
import type { Interactable } from "shared/structs/interactable";
import "../dev";

const characterData: Writable<CharacterData> = newCharacterData("Mock", School.Myth);
characterData.xp += 54;

const mockHudState: HudProps = {
  character: source(characterData),
  bookOpen: source(false),
  activeDialog: source<Maybe<DialogID>>(undefined),
  activeInteractable: source<Maybe<Interactable>>(undefined)
};

export = hoarcekat(() => <HUD {...mockHudState} />);