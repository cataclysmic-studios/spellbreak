import Vide, { source } from "@rbxts/vide";

import { newCharacterData } from "shared/utility/character";
import { hoarcekat } from "../utility/hoarcekat";
import { School } from "shared/structs/school";
import "../dev";

import { Spellbook } from "../components/spellbook";

export = hoarcekat(() => <Spellbook isOpen={source(true)} character={() => newCharacterData("Mock", School.Myth)} />);