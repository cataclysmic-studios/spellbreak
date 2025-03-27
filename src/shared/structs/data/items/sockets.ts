import type { Jewel, Pin } from "./jewel";

export interface GearSocket<SocketKind extends number = number> {
  readonly kind: SocketKind;
}

export const enum JewelSocketKind {
  Tear,
  Square,
  Circle,
  Triangle,
  Star
}

export const enum PinSocketKind {
  Sword,
  Shield,
  Power
}

export interface JewelSocket extends GearSocket<JewelSocketKind> {
  readonly jewel: Maybe<Jewel>;
}

export interface PinSocket extends GearSocket<PinSocketKind> {
  readonly pin: Maybe<Pin>;
}