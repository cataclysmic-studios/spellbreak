import { Players } from "@rbxts/services";
import { atom } from "@rbxts/charm";

import { Character } from "./classes/character";

export const duelCameraHeight = atom(24);
export const duelCameraDistance = atom(42);

export const player = Players.LocalPlayer;
export const playerGui = player.WaitForChild("PlayerGui");

const model = player.Character ?? player.CharacterAdded.Wait()[0];
export const character = new Character(model as CharacterModel);
