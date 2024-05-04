import type { Jewel } from "./items/jewel";

export interface Socket<SocketType extends string = string> {
  readonly type: SocketType;
}

export const enum JewelSocketType {
  Square = "Square",
  Circle = "Circle",
  Triangle = "Triangle",
  Star = "Star"
}

export interface JewelSocket extends Socket<JewelSocketType> {
  readonly jewel: Maybe<Jewel>;
}