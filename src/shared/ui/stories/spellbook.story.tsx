import Vide, { source } from "@rbxts/vide";
import { Book } from "../components/book";
import { hoarcekat } from "../utility/hoarcekat";
import "../dev";

export = hoarcekat(() => <Book isOpen={source(true)} />);