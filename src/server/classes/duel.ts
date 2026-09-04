import { safeCast } from "@rbxts/flamework-meta-utils";

import { basePlayerStartingPips, duelApproachDuration, duelGatherWindowDuration } from "shared/constants";
import { DuelCirclePosition } from "shared/structs/duel";
import {
  attachCombatantSigil, getDuelCirclePositionPart, getGroundedTargetCFrame,
  moveCombatantToDuelPosition, playCombatantAddedAnimation, pointAtFirstTurnCombatant
} from "shared/utility/duel";
import { getSpellFromReference } from "shared/utility/spell";
import { CombatantPips } from "./combatant-pips";

import type { SpellReference } from "shared/structs/data/reference/spell";
import type { Enemy } from "./enemy";

/** Position folders only go up to a 4th slot. */
const MAX_COMBATANTS_PER_SIDE = 4;

/**
 * A duel circle from the moment it's placed through the end of its planning phase. Starts out
 * "forming" - combatants can still join either side as they arrive - and locks in once nobody's
 * joined for `duelGatherWindowDuration` seconds, at which point `pointAtFirstTurnCombatant`
 * picks who casts first and `onLockedIn` fires so the owning service can kick off planning.
 */
export class ActiveDuel {
  public readonly players: Player[] = [];
  public readonly enemies: Enemy[] = [];
  /** Each ready player's chosen spell for the round, `undefined` for a pass. */
  public readonly choices = new Map<Player, Maybe<SpellReference>>();
  public firstTurnOnTeam = false;
  public locked = false;

  private readonly pipsByModel = new Map<CombatantModel, CombatantPips>();
  private pendingArrivals = 0;
  private gatherThread?: thread;
  private readonly lockedInCallbacks: ((duel: ActiveDuel) => void)[] = [];

  public constructor(
    public readonly id: number,
    public readonly circle: DuelCircleModel
  ) { }

  public hasRoomForPlayer(): boolean {
    return this.players.size() < MAX_COMBATANTS_PER_SIDE;
  }

  public hasRoomForEnemy(): boolean {
    return this.enemies.size() < this.getMaxEnemies();
  }

  /** Opponent-side cap scales with team size - 1 player allows 2 enemies, 2 players allow 3, 3+ players allow the full 4 slots. */
  private getMaxEnemies(): number {
    return math.min(math.max(this.players.size(), 1) + 1, MAX_COMBATANTS_PER_SIDE);
  }

  /** Runs once this duel locks in - once nobody's joined for `duelGatherWindowDuration` seconds after the last arrival. Can be called more than once to register multiple listeners. */
  public onceLockedIn(callback: (duel: ActiveDuel) => void): void {
    this.lockedInCallbacks.push(callback);
  }

  /**
   * Sends `player` (already confirmed to have `character`) running to the next open team-side
   * slot, starting them off with `basePlayerStartingPips` pips - each independently rolled
   * against `powerPipChance` to come in as a power pip instead (gear granting bonus starting
   * pips isn't wired up yet). `announce` plays the join effect on arrival - pass `false` for the
   * founding combatant(s), `true` for anyone joining afterward.
   */
  public addPlayer(player: Player, character: CharacterModel, powerPipChance: number, announce: boolean): void {
    this.players.push(player);
    this.moveIntoSlot(
      character, this.circle.teamPositions, this.players.size() - 1,
      pips => pips.gainWithChance(powerPipChance, basePlayerStartingPips),
      announce
    );
  }

  /** Sends `enemy` running to the next open opponent-side slot, starting them off with their descriptor's flat `startingPips`. `announce` plays the join effect on arrival - pass `false` for the founding combatant(s), `true` for anyone joining afterward. */
  public addEnemy(enemy: Enemy, announce: boolean): void {
    this.enemies.push(enemy);
    this.moveIntoSlot(
      enemy.model, this.circle.opponentPositions, this.enemies.size() - 1,
      pips => pips.add(false, enemy.descriptor.startingPips),
      announce
    );
  }

  /** This combatant's pip tracker, or `undefined` if they haven't arrived at their slot yet. */
  public getPips(model: CombatantModel): Maybe<CombatantPips> {
    return this.pipsByModel.get(model);
  }

  /** Clones every combatant's pip visuals in - call once the planning UI actually appears, not at join time, so pips don't spoil before the player can see them alongside their hand. */
  public revealPips(): void {
    for (const [, pips] of this.pipsByModel) pips.reveal();
  }

  /** Spends every ready player's chosen spell's pip cost - call once casting actually begins. Passing players, and any player without a character or pip tracker right now, are skipped. */
  public spendChosenPips(): void {
    for (const [player, spellReference] of this.choices) {
      if (spellReference === undefined) continue;

      const character = safeCast<CharacterModel>(player.Character);
      if (character === undefined) continue;

      this.getPips(character)?.spend(getSpellFromReference(spellReference).cost);
    }
  }

  private moveIntoSlot(
    model: CombatantModel,
    positions: DuelCirclePositions,
    index: number,
    seedPips: (pips: CombatantPips) => void,
    announce: boolean
  ): void {
    // A new arrival means the duel can't lock in yet, even if a gather window from a previous
    // arrival was already counting down.
    this.cancelGatherWindow();
    this.pendingArrivals++;

    const targetPart = getDuelCirclePositionPart(positions, index as DuelCirclePosition);
    const targetCFrame = getGroundedTargetCFrame(model, targetPart);

    // No running animation yet for either combatant - see moveCombatantToDuelPosition.
    moveCombatantToDuelPosition(model, targetCFrame, undefined, duelApproachDuration, () => {
      // Only active combatants get a sigil/pips - one standing in the circle but still
      // approaching shouldn't have either yet.
      attachCombatantSigil(model);
      const pips = new CombatantPips(model);
      seedPips(pips);
      this.pipsByModel.set(model, pips);
      if (announce) playCombatantAddedAnimation(this.circle);

      this.pendingArrivals--;
      if (this.pendingArrivals <= 0) this.restartGatherWindow();
    });
  }

  private cancelGatherWindow(): void {
    if (this.gatherThread === undefined) return;
    task.cancel(this.gatherThread);
    this.gatherThread = undefined;
  }

  private restartGatherWindow(): void {
    if (this.locked) return;
    this.cancelGatherWindow();
    this.gatherThread = task.delay(duelGatherWindowDuration, () => {
      this.gatherThread = undefined;
      this.lockIn();
    });
  }

  private lockIn(): void {
    if (this.locked || this.pendingArrivals > 0) return;

    this.locked = true;
    this.firstTurnOnTeam = pointAtFirstTurnCombatant(this.circle);
    this.lockedInCallbacks.forEach(callback => callback(this));
  }
}
