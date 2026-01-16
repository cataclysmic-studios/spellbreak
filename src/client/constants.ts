import { Players } from "@rbxts/services";

import { Character } from "./classes/character";
import { safeCast } from "@rbxts/flamework-meta-utils";

export const player = Players.LocalPlayer;
export const playerGui = player.WaitForChild("PlayerGui");

const model = safeCast<CharacterModel>(player.Character ?? player.CharacterAdded.Wait()[0]);
assert(model !== undefined, "character model type not assignable to CharacterModel");

export const character = new Character(model);