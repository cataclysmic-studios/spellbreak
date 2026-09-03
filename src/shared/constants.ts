import { ReplicatedStorage } from "@rbxts/services";

import { fixNumericKeys } from "./utility/data";
import { newCharacterData } from "./utility/character";
import { EnemyKind } from "./structs/enemy/kind";
import { SpellKind } from "./structs/spell";
import { School } from "./structs/school";
import type { PlayerData } from "./structs/data";

export const { assets } = ReplicatedStorage;
export const XZ = new Vector3(1, 0, 1);

export const timerLength = 30;
/** Seconds both combatants take to run into their duel circle positions - fixed, so distance doesn't desync their arrival. */
export const duelApproachDuration = 2;
/** Seconds the camera takes to ease between duel poses (planning once both combatants are in position, casting overview once everyone's chosen, casting focus once the first caster's animation starts). */
export const duelCameraTransitionDuration = 0.6;
/** Seconds after the casting overview pose that the first caster's cast animation starts, at which point the camera eases into the casting focus pose. */
export const duelCastingFocusDelay = 0.5;
/** Seconds a forming duel waits, after its last new combatant finishes arriving, before locking in its combatant list and starting planning - gives other nearby combatants a window to join. Restarts every time someone new joins. */
export const duelGatherWindowDuration = 3;
/** Studs in front of the player (along their facing direction) that a duel circle spawns when the zone has no designated duel spawns nearby - keeps the circle from appearing centered on the player's body, since the enemy's position at the moment of the triggering touch is right on top of theirs. */
export const duelCircleSpawnOffset = 12;
export const cardAspectRatio = 0.68;
/**
 * All spell card content (`BaseCardButton`, `CardDescription`) is laid out at
 * this fixed reference resolution and rendered at its actual on-screen size
 * via a single `UIScale`, instead of using `TextScaled`/`Size.Scale` against a
 * continuously-resizing frame - the latter forces Roblox to re-run its text-fit
 * search every frame the card resizes (hover magnify, hand layout, viewport
 * changes), which is what produced the visibly jittery/"spasmic" card text.
 */
export const cardReferenceWidth = 300;
export const cardReferenceHeight = cardReferenceWidth / cardAspectRatio;
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
  npc: Color3.fromRGB(0, 237, 0),
  enemy: {
    [EnemyKind.Regular]: Color3.fromRGB(255, 255, 0),
    [EnemyKind.Regular2]: Color3.fromRGB(255, 163, 0),
    [EnemyKind.Elite]: Color3.fromRGB(255, 0, 0),
    [EnemyKind.Boss]: Color3.fromRGB(122, 33, 209)
  }
};

export const defaultData: PlayerData = {
  crowns: 0,
  characters: [fixNumericKeys(newCharacterData("Test Monkey", School.Myth))]
};