import type Jewel from "./items/jewel";

export interface Socket {
  readonly type: string;
}

export interface JewelSocket extends Socket {
  readonly type: "Square" | "Circle" | "Triangle" | "Star";
  readonly jewel: Maybe<Jewel>;
}