import { type PlayableSchool, School } from "../data-models/school";
import type { CharacterData } from "../data-models/character-data";

export const DEFAULT_HEALTHS: Record<PlayableSchool, number> = {
  Fire: 415,
  Frost: 500,
  Storm: 400,
  Myth: 425,
  Life: 460,
  Death: 450,
  Balance: 480
};

const DEFAULT_MANA = 10;
const DEFAULT_ENERGY = 40;

export const NEW_CHARACTER: Omit<CharacterData, "id" | "name" | "school"> = {
  xp: 0,
  level: 0,
  gold: 0,
  arenaTickets: 0,
  trainingPoints: 0,

  stats: {
    maxHealth: 0,
    maxMana: DEFAULT_MANA,
    maxEnergy: DEFAULT_ENERGY,
    health: 0,
    mana: DEFAULT_MANA,
    energy: DEFAULT_ENERGY,

    powerPipChance: 0,
    shadowPipRating: 0,
    stunResistance: 0,
    maxShadowPips: 0,
    healing: {
      incoming: 0,
      outgoing: 0
    },

    damage: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    flatDamage: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    resist: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    flatResist: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    accuracy: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    criticalRating: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    criticalBlockRating: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    },
    piercing: {
      [School.Fire]: 0,
      [School.Frost]: 0,
      [School.Storm]: 0,
      [School.Life]: 0,
      [School.Death]: 0,
      [School.Myth]: 0,
      [School.Balance]: 0,
      [School.Solar]: 0,
      [School.Lunar]: 0,
      [School.Stellar]: 0,
      [School.Shadow]: 0
    }
  },
  trainedSpells: [],
  equippedGear: {},
  backpack: [],
  housingItems: []
};