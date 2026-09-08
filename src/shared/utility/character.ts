import { GearCategory } from "shared/structs/data/items/gear";
import { SpellReference } from "shared/structs/data/reference/spell";
import { DeckReference } from "shared/structs/data/reference/gear/deck";
import { ZoneID } from "shared/structs/zone";
import { type PlayableSchool, School } from "shared/structs/school";
import { getGearByReference, hasStats } from "shared/utility/items";
import type { CharacterStats, PerSchoolStats } from "shared/structs/data/character-stats";
import type { GearData } from "shared/structs/data/items/gear";
import type { CharacterData } from "shared/structs/data";

const { min, floor, round } = math;
type Mutable<T> = { -readonly [K in keyof T]: T[K]; };

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

export interface LevelProgress {
  readonly level: number;
  /** XP earned since hitting `level`, i.e. progress toward `xpForNextLevel`. */
  readonly xpIntoLevel: number;
  readonly xpForNextLevel: number;
}

/** Derives level and in-level progress from total accumulated XP - level is never stored, only `xp`. */
export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let xpIntoLevel = totalXp;
  let xpForNextLevel = getRequiredXpForNextLevel(level);
  while (xpIntoLevel >= xpForNextLevel) {
    xpIntoLevel -= xpForNextLevel;
    level += 1;
    xpForNextLevel = getRequiredXpForNextLevel(level);
  }

  return { level, xpIntoLevel, xpForNextLevel };
}

export function getCharacterLevel(totalXp: number): number {
  return getLevelProgress(totalXp).level;
}

const DEFAULT_HEALTHS: Record<PlayableSchool, number> = {
  [School.Fire]: 415,
  [School.Ice]: 500,
  [School.Storm]: 400,
  [School.Myth]: 425,
  [School.Life]: 460,
  [School.Death]: 450,
  [School.Balance]: 480
};

/** Per-level health growth rate per school, fit from the wiki's base-stats level chart (https://wizard101.fandom.com/wiki/Level_Chart, levels 1-50). */
const HEALTH_GROWTH: Record<PlayableSchool, number> = {
  [School.Fire]: 22.14,
  [School.Ice]: 31.12,
  [School.Storm]: 16.33,
  [School.Myth]: 21.94,
  [School.Life]: 27.35,
  [School.Death]: 24.49,
  [School.Balance]: 26.94
};

const BASE_MANA = 15;
const MANA_GROWTH = 2.14;
const MANA_CAP = 120;

const BASE_ENERGY = 40;
const ENERGY_GROWTH = 0.51;

export function getBaseMaxHealth(level: number, school: PlayableSchool): number {
  return floor(DEFAULT_HEALTHS[school] + HEALTH_GROWTH[school] * (level - 1));
}

export function getBaseMaxMana(level: number): number {
  return min(floor(BASE_MANA + MANA_GROWTH * (level - 1)), MANA_CAP);
}

export function getBaseMaxEnergy(level: number): number {
  return floor(BASE_ENERGY + ENERGY_GROWTH * (level - 1));
}

/** Starts at level 10, ramping to a 40% cap by level 50 (per the wiki level chart - see `HEALTH_GROWTH`). Returned as a 0-1 chance, matching `CombatantPips.gainWithChance`. */
export function getBasePowerPipChance(level: number): number {
  if (level < 10) return 0;
  return min(round(10 + (level - 10) * 0.75), 40) / 100;
}

/** Wizard101 doesn't publish an exact per-level shadow pip rating table - approximated as +1 every 30 levels past the level-90 unlock, capped at 3. */
export function getBaseShadowPipRating(level: number): number {
  if (level < 90) return 0;
  return min(floor((level - 90) / 30) + 1, 3);
}

function zeroPerSchoolStats(): Mutable<PerSchoolStats<number>> {
  return {
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
  };
}

function addPerSchoolStats(target: Mutable<PerSchoolStats<number>>, addend?: Partial<PerSchoolStats<number>>): void {
  if (addend === undefined) return;
  target[School.Fire] += addend[School.Fire] ?? 0;
  target[School.Ice] += addend[School.Ice] ?? 0;
  target[School.Storm] += addend[School.Storm] ?? 0;
  target[School.Life] += addend[School.Life] ?? 0;
  target[School.Death] += addend[School.Death] ?? 0;
  target[School.Myth] += addend[School.Myth] ?? 0;
  target[School.Balance] += addend[School.Balance] ?? 0;
  target[School.Stellar] += addend[School.Stellar] ?? 0;
  target[School.Lunar] += addend[School.Lunar] ?? 0;
  target[School.Solar] += addend[School.Solar] ?? 0;
  target[School.Shadow] += addend[School.Shadow] ?? 0;
}

type EquippableGearCategory = Exclude<GearCategory, GearCategory.Pet | GearCategory.Deck>;
const EQUIPPABLE_GEAR_CATEGORIES: readonly EquippableGearCategory[] = [
  GearCategory.Hat, GearCategory.Robe, GearCategory.Boots, GearCategory.Wand,
  GearCategory.Athame, GearCategory.Amulet, GearCategory.Ring, GearCategory.Mount
];

function getEquippedGearList(character: CharacterData): GearData[] {
  const gearList: GearData[] = [];
  for (const category of EQUIPPABLE_GEAR_CATEGORIES) {
    const index = character.equippedGear[category];
    if (index === undefined) continue;

    const reference = character.backpack[category][index];
    if (reference === undefined) continue;

    gearList.push(getGearByReference(reference));
  }

  return gearList;
}

/** Computes a character's full stat sheet from their level (derived from XP) and equipped gear - nothing here is persisted. */
export function getCharacterStats(character: CharacterData): CharacterStats {
  const level = getCharacterLevel(character.xp);

  let maxHealth = getBaseMaxHealth(level, character.school);
  let maxMana = getBaseMaxMana(level);
  let maxEnergy = getBaseMaxEnergy(level);
  let powerPipChance = getBasePowerPipChance(level);
  let shadowPipRating = getBaseShadowPipRating(level);
  let incomingHealing = 0;
  let outgoingHealing = 0;
  let stunResistance = 0;

  const damage = zeroPerSchoolStats();
  const resist = zeroPerSchoolStats();
  const accuracy = zeroPerSchoolStats();
  const criticalRating = zeroPerSchoolStats();
  const criticalBlockRating = zeroPerSchoolStats();
  const pierce = zeroPerSchoolStats();

  for (const gear of getEquippedGearList(character)) {
    if (!hasStats(gear)) continue;

    const { stats } = gear;
    maxHealth += stats.maxHealth ?? 0;
    maxMana += stats.maxMana ?? 0;
    maxEnergy += stats.maxEnergy ?? 0;
    powerPipChance += stats.powerPipChance ?? 0;
    shadowPipRating += stats.shadowPipRating ?? 0;
    incomingHealing += stats.incomingHealing ?? 0;
    outgoingHealing += stats.outgoingHealing ?? 0;
    stunResistance += stats.stunResistance ?? 0;
    addPerSchoolStats(damage, stats.damage);
    addPerSchoolStats(resist, stats.resist);
    addPerSchoolStats(accuracy, stats.accuracy);
    addPerSchoolStats(criticalRating, stats.criticalRating);
    addPerSchoolStats(criticalBlockRating, stats.criticalBlockRating);
    addPerSchoolStats(pierce, stats.pierce);
  }

  return {
    health: maxHealth,
    mana: maxMana,
    energy: maxEnergy,
    maxHealth,
    maxMana,
    maxEnergy,
    powerPipChance,
    shadowPipRating,
    incomingHealing,
    outgoingHealing,
    stunResistance,
    damage,
    resist,
    accuracy,
    criticalRating,
    criticalBlockRating,
    pierce
  };
}

export function newCharacterData(name: string, school: PlayableSchool): CharacterData {
  return {
    name, school,
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
    currentZone: ZoneID.HeadmastersOffice
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