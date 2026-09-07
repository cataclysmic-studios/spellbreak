import Vide, { source } from "@rbxts/vide";

import { newCharacterData } from "shared/utility/character";
import { hoarcekat } from "../utility/hoarcekat";
import { School } from "shared/structs/school";
import "../dev";

import { BookPage, Spellbook } from "../components/spellbook";

export = hoarcekat(() => <Spellbook isOpen={source(true)} page={source(BookPage.Character as BookPage)} character={() => newCharacterData("Mock", School.Myth)} />);