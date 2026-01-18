import Vide, { source } from "@rbxts/vide";

import { NpcID } from "shared/structs/npc/descriptor";
import { hoarcekat } from "../utility/hoarcekat";
import type { Interactable } from "shared/structs/interactable";
import "../dev";

import { InteractPrompt } from "../components/interact-prompt";
import { Images } from "../utility/images";

const interactable = source<Maybe<Interactable>>(NpcID.HeadmasterHale);
export = hoarcekat(() => <InteractPrompt interactable={interactable} inputs={[Images.Input_X, Images.Input_LeftClick]} visible={() => true} />);