import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { newCharacterData } from "shared/utility/character";
import { School } from "shared/structs/school";
import { HUD, type HudProps } from "../views/hud";
import type { DialogID } from "shared/structs/npc/dialog";
import "../dev";

const mockHudState: HudProps = {
  character: source(newCharacterData("Mock", School.Myth)),
  bookOpen: source(false),
  activeDialog: source<Maybe<DialogID>>(undefined)
};

export = hoarcekat(() => <HUD {...mockHudState} />);