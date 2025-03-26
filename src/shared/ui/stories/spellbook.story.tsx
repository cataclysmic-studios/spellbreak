import Vide, { source } from "@rbxts/vide";
import { Spellbook } from "../components/spellbook";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

export = hoarcekat(() => <Spellbook isOpen={source(true)} />);