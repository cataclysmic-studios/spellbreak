import { component } from "@rbxts/matter";
import { $nameof } from "rbxts-transform-debug";

export const Character = component<Character>($nameof<Character>());
export interface Character {
  readonly model: Model;
  velocity: Vector3;
}