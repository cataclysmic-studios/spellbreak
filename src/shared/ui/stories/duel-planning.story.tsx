import { Timer } from "@rbxts/timer";
import Vide from "@rbxts/vide";

import { hoarcekat } from "../utility/hoarcekat";
import { createMockDuelInfo } from "./common";
import { timerLength } from "shared/constants";
import "../dev";

import { DuelPlanning } from "../views/duel-planning";

const duelInfo = createMockDuelInfo();
// duelInfo.state.deck.draw(2);
const timer = new Timer(timerLength);
timer.start();
export = hoarcekat(() => <DuelPlanning duelInfo={duelInfo} timer={() => timer} />);