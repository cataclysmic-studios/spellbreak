import { ReplicatedStorage } from "@rbxts/services";
import Signal from "@rbxts/lemon-signal";

import { EnemyKind } from "./structs/enemy/kind";
import { School } from "./structs/school";
import { Images } from "./ui/utility/images";
import { CardKind } from "./structs/spell-card";
import { SpellType } from "./structs/spell";

export const { assets } = ReplicatedStorage;

export const cardAspectRatio = 0.68;
export const cardArtSpritesheets: { colored: string; grayscale: string; }[] = [
  {
    colored: "rbxassetid://89063483535157",
    grayscale: "rbxassetid://131276102206825"
  },
  {
    colored: "rbxassetid://72199822054271",
    grayscale: "rbxassetid://119954144892949"
  }
];

export const grayscaleCardImages: Record<CardKind, string> = {
  [CardKind.Normal]: Images.SchoolCardBW,
  [CardKind.Treasure]: Images.TreasureCardBW,
  [CardKind.Item]: Images.ItemCardBW
}

export const schoolCardImages: Record<School, string> = {
  [School.Fire]: Images.FireCard,
  [School.Ice]: Images.IceCard,
  [School.Storm]: Images.StormCard,
  [School.Life]: Images.LifeCard,
  [School.Death]: Images.DeathCard,
  [School.Myth]: Images.MythCard,
  [School.Balance]: Images.BalanceCard,
  [School.Stellar]: Images.StellarCard,
  [School.Lunar]: Images.LunarCard,
  [School.Solar]: Images.SolarCard,
  [School.Shadow]: Images.ShadowCard
};

export const nametagColors = {
  player: Color3.fromRGB(4, 154, 240),
  friend: Color3.fromRGB(168, 234, 254),
  bestFriend: Color3.fromRGB(180, 151, 240),
  enemy: {
    [EnemyKind.Regular]: Color3.fromRGB(255, 255, 0),
    [EnemyKind.Regular2]: Color3.fromRGB(255, 163, 0),
    [EnemyKind.Elite]: Color3.fromRGB(255, 0, 0),
    [EnemyKind.Boss]: Color3.fromRGB(122, 33, 209)
  }
};

export const flameworkIgnited = new Signal;