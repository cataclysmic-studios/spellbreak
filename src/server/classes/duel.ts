import { duelApproachDuration, duelGatherWindowDuration } from "shared/constants";
import { DuelCirclePosition } from "shared/structs/duel";
import {
  attachCombatantSigil, getDuelCirclePositionPart, getGroundedTargetCFrame,
  moveCombatantToDuelPosition, playCombatantAddedAnimation, pointAtFirstTurnCombatant
} from "shared/utility/duel";

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
  public readonly readyPlayers = new Set<Player>();
  public firstTurnOnTeam = false;
  public locked = false;

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
    return this.enemies.size() < MAX_COMBATANTS_PER_SIDE;
  }

  /** Runs once this duel locks in - once nobody's joined for `duelGatherWindowDuration` seconds after the last arrival. Can be called more than once to register multiple listeners. */
  public onceLockedIn(callback: (duel: ActiveDuel) => void): void {
    this.lockedInCallbacks.push(callback);
  }

  /** Sends `player` (already confirmed to have `character`) running to the next open team-side slot. `announce` plays the join effect on arrival - pass `false` for the founding combatant(s), `true` for anyone joining afterward. */
  public addPlayer(player: Player, character: CharacterModel, announce: boolean): void {
    this.players.push(player);
    this.moveIntoSlot(character, this.circle.teamPositions, this.players.size() - 1, announce);
  }

  /** Sends `enemy` running to the next open opponent-side slot. `announce` plays the join effect on arrival - pass `false` for the founding combatant(s), `true` for anyone joining afterward. */
  public addEnemy(enemy: Enemy, announce: boolean): void {
    this.enemies.push(enemy);
    this.moveIntoSlot(enemy.model, this.circle.opponentPositions, this.enemies.size() - 1, announce);
  }

  private moveIntoSlot(model: CombatantModel, positions: DuelCirclePositions, index: number, announce: boolean): void {
    // A new arrival means the duel can't lock in yet, even if a gather window from a previous
    // arrival was already counting down.
    this.cancelGatherWindow();
    this.pendingArrivals++;

    const targetPart = getDuelCirclePositionPart(positions, index as DuelCirclePosition);
    const targetCFrame = getGroundedTargetCFrame(model, targetPart);

    // No running animation yet for either combatant - see moveCombatantToDuelPosition.
    moveCombatantToDuelPosition(model, targetCFrame, undefined, duelApproachDuration, () => {
      // Only active combatants get a sigil - one standing in the circle but still approaching
      // shouldn't have one yet.
      attachCombatantSigil(model);
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
