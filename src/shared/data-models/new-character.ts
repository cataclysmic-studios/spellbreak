import { School } from "./school";
import type { CharacterData } from "./character-data";

const NEW_CHARACTER: Omit<CharacterData, "id" | "name" | "school"> = {
  xp: 0,
  level: 0,
  gold: 0,
  arenaTickets: 0,
  trainingPoints: 0,

  stats: {
    health: 0,
    mana: 10,
    energy: 40,

    powerPipChance: 0,
    shadowPipRating: 0,
    stunResistance: 0,
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
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
      [School.Darkness]: 0
    }
  },
  equippedGear: {},
  backpack: [],
  housingItems: []
};

export default NEW_CHARACTER;