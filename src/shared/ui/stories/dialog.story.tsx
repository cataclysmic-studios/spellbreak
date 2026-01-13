import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { Dialog } from "../components/dialog";
import { DialogID } from "shared/structs/npc/dialog";

const id = source<Maybe<DialogID>>(DialogID.enrollment_day_intro);
export = hoarcekat(() => <Dialog id={id} />);