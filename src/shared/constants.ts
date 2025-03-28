import { ReplicatedStorage } from "@rbxts/services";
import Signal from "@rbxts/lemon-signal";

import { EnemyKind } from "./structs/enemy/kind";
import type { PlayerData } from "./structs/data";
import { SpellKind } from "./structs/spell";

export const { assets } = ReplicatedStorage;

export const defaultData: PlayerData = {
  crowns: 0,
  characters: []
};

export const timerLength = 30;
export const cardAspectRatio = 0.68;
export const maxCardsInHand = 7;
export const spellKindImages: Record<SpellKind, string> = {
  [SpellKind.Damage]: "rbxassetid://108143298466355",
  [SpellKind.AOE]: "rbxassetid://118350657741477",
  [SpellKind.Drain]: "rbxassetid://109389322750574",
  [SpellKind.Heal]: "rbxassetid://108034974071682",
  [SpellKind.Charm]: "rbxassetid://93511865864214",
  [SpellKind.Curse]: "rbxassetid://119491980571867",
  [SpellKind.Trap]: "rbxassetid://97697467985473",
  [SpellKind.Jinx]: "rbxassetid://135872189432164",
  [SpellKind.Ward]: "rbxassetid://91030799412195",
  [SpellKind.Aura]: "rbxassetid://137432911637486",
  [SpellKind.Global]: "rbxassetid://137993823959278",
  [SpellKind.Enchantment]: "rbxassetid://89333027044620",
  [SpellKind.Manipulation]: "rbxassetid://133882234415702",
  [SpellKind.Polymorph]: "rbxassetid://109141779555025",
  [SpellKind.Mutate]: "rbxassetid://86695891024037"
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
