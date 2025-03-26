import { ReplicatedStorage } from "@rbxts/services";
import Signal from "@rbxts/lemon-signal";

import { EnemyKind } from "./structs/enemy/kind";
import { CardKind, type SpellCard } from "./structs/spell-card";
import Troll from "./spells/myth/troll";
import type { CharacterData, PlayerData } from "./structs/data";
import { School } from "./structs/school";

export const { assets } = ReplicatedStorage;

const testCharacter: CharacterData = {
  name: "Roslyn ShadowWraith",
  school: School.Death,
  level: 1,
  xp: 0,
  gold: 0,
  trainingPoints: 0,
  lastLocation: Vector3.zero,
  stats: {
    health: 450,
    mana: 15,
    energy: 40,
    maxHealth: 450,
    maxMana: 15,
    maxEnergy: 40,
    powerPipChance: 0,
    shadowPipRating: 0,
    incomingHealing: 0,
    outgoingHealing: 0,
    stunResistance: 0,
    damage: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    },
    resist: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    },
    accuracy: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    },
    criticalRating: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    },
    criticalBlockRating: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    },
    pierce: {
      [School.Fire]: 0,
      [School.Ice]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Stellar]: 0,
      [School.Lunar]: 0,
      [School.Solar]: 0,
      [School.Shadow]: 0
    }
  }
};

export const defaultData: PlayerData = {
  crowns: 0,
  characters: [testCharacter]
};

export const testCards: SpellCard[] = [
  {
    cardKind: CardKind.Normal,
    spell: Troll
  }, {
    cardKind: CardKind.Normal,
    spell: Troll
  }
];

export const cardAspectRatio = 0.68;

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