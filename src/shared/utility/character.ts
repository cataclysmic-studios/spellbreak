import { GearCategory } from "shared/structs/data/items/gear";
import { SpellReference } from "shared/structs/data/reference/spell";
import { DeckReference } from "shared/structs/data/reference/gear/deck";
import { SpellCardKind } from "shared/structs/spell/card";
import { ZoneID } from "shared/structs/zone";
import { type PlayableSchool, School } from "shared/structs/school";
import type { CharacterData } from "shared/structs/data";

const { min, floor } = math;

export function getMaxGold(level: number): number {
  if (level < 80) return 200_000;
  if (level < 90) return 350_000;
  if (level < 95) return 375_000;
  if (level < 100) return 400_000;
  if (level < 110) return 425_000;
  if (level < 120) return 450_000;
  if (level < 130) return 500_000;
  return 525_000;
}

export function getSchoolTitle(school: PlayableSchool): string {
  switch (school) {
    case School.Fire: return "Pyromancer";
    case School.Ice: return "Thaumaturge";
    case School.Storm: return "Diviner";
    case School.Life: return "Theurgist";
    case School.Death: return "Necromancer";
    case School.Myth: return "Conjurer";
    case School.Balance: return "Sorcerer";
  }
}

export function getLevelTitle(level: number): string {
  if (level < 10) return "Novice";
  if (level < 15) return "Initiate";
  if (level < 20) return "Apprentice";
  if (level < 30) return "Adept";
  if (level < 40) return "Magus";
  if (level < 50) return "Master";
  if (level < 60) return "Grandmaster";
  if (level < 70) return "Legendary";
  if (level < 80) return "Transcendent";
  if (level < 90) return "Archmage";
  if (level < 100) return "Promethean";
  if (level < 110) return "Exalted";
  if (level < 120) return "Prodigious";
  if (level < 130) return "Champion";
  if (level < 140) return "Visionary";
  if (level < 150) return "Cosmic";
  if (level < 160) return "Paragon";
  if (level < 170) return "Prime";
  if (level < 180) return "Supreme";
  return "Eternal";
}

const base = 100;
const growth = 1.08;
const hardCap = 1.25e6;
export function getRequiredXpForNextLevel(level: number): number {
  return min(floor(base * level * level * growth), hardCap);
}

/** Adds `amount` XP to `xp`, rolling any levels gained (and their leftover XP) forward. */
export function applyXp(level: number, xp: number, amount: number): { level: number; xp: number; } {
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
    arenaTickets: 0,
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
            mainSpellReferences: [SpellReference.Myth_Troll, SpellReference.Myth_Troll],
            itemCardSpellReferences: [SpellReference.Myth_Mythblade],
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