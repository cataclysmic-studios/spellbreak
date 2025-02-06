import { ReplicatedStorage } from "@rbxts/services";
import Signal from "@rbxts/lemon-signal";

import { EnemyType } from "./structs/enemy/type";

export const { assets } = ReplicatedStorage;

export const nametagColors = {
  player: Color3.fromRGB(4, 154, 240),
  friend: Color3.fromRGB(168, 234, 254),
  bestFriend: Color3.fromRGB(180, 151, 240),
  enemy: {
    [EnemyType.Regular]: Color3.fromRGB(255, 255, 0),
    [EnemyType.Regular2]: Color3.fromRGB(255, 163, 0),
    [EnemyType.Elite]: Color3.fromRGB(255, 0, 0),
    [EnemyType.Boss]: Color3.fromRGB(122, 33, 209)
  }
};

export const flameworkIgnited = new Signal;