import { GearCategory } from "shared/structs/data/items/gear";
import { SpellReference } from "shared/structs/data/reference/spell";
import { DeckReference } from "shared/structs/data/reference/gear/deck";
import { SpellCardKind } from "shared/structs/spell/card";
import { type PlayableSchool, School } from "shared/structs/school";
import { ZoneID } from "shared/structs/zone";
import type { CharacterData } from "shared/structs/data";

const { min, floor } = math;

const base = 100;
const growth = 1.08;
const hardCap = 1.25e6;
export function getRequiredXpForNextLevel(level: number): number {
  return min(floor(base * level * level * growth), hardCap);
}

/** Adds `amount` XP to `xp`, rolling any levels gained (and their leftover XP) forward. */
export function applyXp(level: number, xp: number, amount: number): { level: number; xp: number } {
  let newLevel = level;
  let newXp = xp + amount;

  let required = getRequiredXpForNextLevel(newLevel);
  while (newXp >= required) {
    newXp -= required;
    newLevel += 1;
    required = getRequiredXpForNextLevel(newLevel);
  }

  return { level: newLevel, xp: newXp };
}

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
    selectedQuest: undefined,
    completedQuests: [],
    activeQuests: {},
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
              // temp
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
            sideboardSpellReferences: [SpellReference.Myth_Mythblade]
          }
        }
      ]
    },
    lastLocation: {
      position: { x: 0, y: 1, z: -594 },
      lookAlong: { x: 0, z: -1 }
    },
    currentZone: ZoneID.HeadmastersOffice,
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

export function locationToCFrame({ position, lookAlong }: CharacterData["lastLocation"]): CFrame {
  const worldPosition = new Vector3(position.x, position.y, position.z);
  const lookDirection = new Vector3(lookAlong.x, 0, lookAlong.z);
  return lookDirection.Magnitude > 0
    ? CFrame.lookAt(worldPosition, worldPosition.add(lookDirection))
    : new CFrame(worldPosition);
}

export function cframeToLocation(cframe: CFrame): CharacterData["lastLocation"] {
  const { X, Y, Z } = cframe.Position;
  const { X: lookX, Z: lookZ } = cframe.LookVector;
  return {
    position: { x: X, y: Y, z: Z },
    lookAlong: { x: lookX, z: lookZ }
  };
}