import Vide, { source } from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

import { newCharacterData } from "shared/utility/character";
import { Dialog } from "../components/dialog";
import { DialogID } from "shared/structs/npc/dialog";
import { School } from "shared/structs/school";

const id = source<Maybe<DialogID>>(DialogID.Wc1_EnrollmentIntro);
const character = source(newCharacterData("Mock", School.Myth));
export = hoarcekat(() => <Dialog character={character} id={id} />);