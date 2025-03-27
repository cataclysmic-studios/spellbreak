import { GearCategory } from "shared/structs/data/items/gear";
import { SpellReference } from "shared/structs/data/reference/spell";
import { DeckReference } from "shared/structs/data/reference/gear/deck";
import { type PlayableSchool, School } from "shared/structs/school";
import type { CharacterData } from "shared/structs/data";
import { SpellCardKind } from "shared/structs/spell-card";

const maxMana = 15;
const maxEnergy = 40;


export const DEFAULT_HEALTHS: Record<PlayableSchool, number> = {
  [School.Fire]: 415,
  [School.Ice]: 500,
  [School.Storm]: 400,
  [School.Myth]: 425,
  [School.Life]: 460,
  [School.Death]: 450,
  [School.Balance]: 480
};

export function newCharacterData(name: string, school: PlayableSchool): CharacterData {
  const maxHealth = DEFAULT_HEALTHS[school];

  return {
    name, school,
    level: 1,
    xp: 0,
    gold: 0,
    trainingPoints: 0,
    trainedSpells: [SpellReference.Myth_Troll],
    equippedGear: {
      [GearCategory.Deck]: 0
    },
    backpack: {
      [GearCategory.Hat]: [],
      [GearCategory.Robe]: [],
      [GearCategory.Boots]: [],
      [GearCategory.Wand]: [],
      [GearCategory.Athame]: [],
      [GearCategory.Amulet]: [],
      [GearCategory.Ring]: [],
      [GearCategory.Pet]: [],
      [GearCategory.Mount]: [],
      [GearCategory.Deck]: [
        {
          reference: DeckReference.StarterDeck,
          data: {
            spellReferences: [
              {
                reference: SpellReference.Myth_Troll,
                data: { spellCardKind: SpellCardKind.Normal }
              }, {
                reference: SpellReference.Myth_Troll,
                data: { spellCardKind: SpellCardKind.Normal }
              }, {
                reference: SpellReference.Myth_Mythblade,
                data: { spellCardKind: SpellCardKind.Normal }
              }
            ],
            sideboardSpellReferences: []
          }
        }
      ]
    },
    lastLocation: {
      position: { x: 0, y: 0, z: 0 },
      lookAlong: { x: 0, y: 0, z: 1 }
    },
    stats: {
      maxHealth,
      maxMana,
      maxEnergy,
      health: maxHealth,
      mana: maxMana,
      energy: maxEnergy,
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
}