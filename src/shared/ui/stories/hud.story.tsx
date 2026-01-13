import Vide, { source } from "@rbxts/vide";

import { HUD, type HudProps } from "../views/hud";
import { hoarcekat } from "../utility/hoarcekat";
import type { DialogID } from "shared/structs/npc/dialog";
import "../dev";

const mockHudState: HudProps = {
  bookOpen: source(false),
  activeDialog: source<Maybe<DialogID>>(undefined)
};

export = hoarcekat(() => <HUD {...mockHudState} />);