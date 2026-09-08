import type { PlayableSchool } from "../school";
import type { CharacterStats } from "./character-stats";
import type { GearCategory } from "./items/gear";
import type { DeckReferenceData } from "./items/gear/deck";
import type { PetReferenceData } from "./items/gear/pet";
import type { GearReference } from "./reference/gear";
import type { SpellReference } from "./reference/spell";
import type { QuestID } from "../quests";
import type { ZoneID } from "../zone";

export interface EquippedGearData {
  readonly [GearCategory.Hat]?: number;
  readonly [GearCategory.Robe]?: number;
  readonly [GearCategory.Boots]?: number;
  readonly [GearCategory.Wand]?: number;
  readonly [GearCategory.Athame]?: number;
  readonly [GearCategory.Amulet]?: number;
  readonly [GearCategory.Ring]?: number;
  readonly [GearCategory.Pet]?: number;
  readonly [GearCategory.Mount]?: number;
  readonly [GearCategory.Deck]?: number;
}

export interface BackpackData {
  readonly [GearCategory.Hat]: GearReference[];
  readonly [GearCategory.Robe]: GearReference[];
  readonly [GearCategory.Boots]: GearReference[];
  readonly [GearCategory.Wand]: GearReference[];
  readonly [GearCategory.Athame]: GearReference[];
  readonly [GearCategory.Amulet]: GearReference[];
  readonly [GearCategory.Ring]: GearReference[];
  readonly [GearCategory.Pet]: PetReferenceData[];
  readonly [GearCategory.Mount]: GearReference[];
  readonly [GearCategory.Deck]: DeckReferenceData[];
}

interface CharacterLocation {
  readonly position: { x: number; y: number; z: number; };
  readonly lookAlong: { x: number; z: number; };
}

export interface CharacterData {
  readonly name: string;
  readonly school: PlayableSchool;
  readonly level: number;
  readonly xp: number;
  readonly gold: number;
  readonly arenaTickets: number;
  readonly trainingPoints: number;
  readonly trainedSpells: SpellReference[];
  readonly selectedQuest?: QuestID;
  readonly completedQuests: QuestID[];
  readonly activeQuests: Partial<Record<QuestID, number>>; // quest id -> goal index
  /** Values represent index in backpack data */
  readonly equippedGear: EquippedGearData;
  readonly backpack: BackpackData;
  readonly stats: CharacterStats;
  readonly lastLocation: CharacterLocation;
  readonly currentZone: ZoneID;
}

export interface PlayerData {
  readonly crowns: number;
  readonly characters: CharacterData[];
}