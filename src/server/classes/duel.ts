import { safeCast } from "@rbxts/flamework-meta-utils";
import Sift from "@rbxts/sift";

import { basePlayerStartingPips, duelApproachDuration, duelGatherWindowDuration, maxCardsInHand } from "shared/constants";
import { DuelCirclePosition, type DuelChoice } from "shared/structs/duel";
import {
  attachCombatantSigil, getDuelCirclePositionPart, getGroundedTargetCFrame,
  moveCombatantToDuelPosition, playCombatantAddedAnimation, pointAtFirstTurnCombatant
} from "shared/utility/duel";
import { getSpellFromReference } from "shared/utility/spell";
import { CombatantPips } from "./combatant-pips";
import { CombatantHealth } from "./combatant-health";

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
  /** Each ready player's chosen spell (and target, if any) for the round, `undefined` for a pass. */
  public readonly choices = new Map<Player, Maybe<DuelChoice>>();
  public firstTurnOnTeam = false;
  public locked = false;

  private readonly pipsByModel = new Map<CombatantModel, CombatantPips>();
  private readonly healthByModel = new Map<CombatantModel, CombatantHealth>();
  /** Pending outgoing-damage bonus (percent) per combatant, from an unconsumed Blade - see `addBlade`/`consumeBladeMultiplier`. */
  private readonly bladeBonusByModel = new Map<CombatantModel, number>();
  /** Each player's current hand size this duel - starts at their dealt hand's size, +1 per sideboard draw. Nothing currently reports a card leaving hand (discarding/casting aren't synced to the server yet), so this only ever grows; still correct for gating sideboard draws against `maxCardsInHand`. */
  private readonly handSizeByPlayer = new Map<Player, number>();
  /** Each player's shuffled, per-duel sideboard - drawn from with `drawSideboard`, seeded once from their equipped deck's `sideboardSpellReferences` via `seedDeckState`. */
  private readonly sideboardByPlayer = new Map<Player, SpellReference[]>();
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
  public addPlayer(player: Player, character: CharacterModel, powerPipChance: number, maxHealth: number, announce: boolean): void {
    this.players.push(player);
    this.moveIntoSlot(
      character, this.circle.teamPositions, this.players.size() - 1,
      pips => pips.gainWithChance(powerPipChance, basePlayerStartingPips),
      maxHealth, announce
    );
  }

  /** Sends `enemy` running to the next open opponent-side slot, starting them off with their descriptor's flat `startingPips`. `announce` plays the join effect on arrival - pass `false` for the founding combatant(s), `true` for anyone joining afterward. */
  public addEnemy(enemy: Enemy, announce: boolean): void {
    this.enemies.push(enemy);
    this.moveIntoSlot(
      enemy.model, this.circle.opponentPositions, this.enemies.size() - 1,
      pips => pips.add(false, enemy.descriptor.startingPips),
      enemy.descriptor.health, announce
    );
  }

  /** This combatant's pip tracker, or `undefined` if they haven't arrived at their slot yet. */
  public getPips(model: CombatantModel): Maybe<CombatantPips> {
    return this.pipsByModel.get(model);
  }

  public getHealth(model: CombatantModel): Maybe<CombatantHealth> {
    return this.healthByModel.get(model);
  }

  /** Clones every combatant's pip visuals in - call once the planning UI actually appears, not at join time, so pips don't spoil before the player can see them alongside their hand. */
  public revealPips(): void {
    for (const [, pips] of this.pipsByModel) pips.reveal();
  }

  /** Seeds `player`'s hand-size counter and shuffles their sideboard for this duel - call once, from `beginPlanning`, right after dealing their starting hand. */
  public seedDeckState(player: Player, initialHandSize: number, sideboardSpellReferences: SpellReference[]): void {
    this.handSizeByPlayer.set(player, initialHandSize);
    this.sideboardByPlayer.set(player, Sift.Array.shuffle(sideboardSpellReferences));
  }

  /** Treasure cards left in `player`'s sideboard this duel. */
  public getSideboardCount(player: Player): number {
    return this.sideboardByPlayer.get(player)?.size() ?? 0;
  }

  /** Whether `player` can draw a sideboard treasure card right now - room left in hand and cards left to draw. */
  public canDrawSideboard(player: Player): boolean {
    return (this.handSizeByPlayer.get(player) ?? 0) < maxCardsInHand && this.getSideboardCount(player) > 0;
  }

  /** Draws `player`'s next sideboard card and grows their tracked hand size by one, or `undefined` if `canDrawSideboard` says no - re-checked here rather than trusted from the request. */
  public drawSideboard(player: Player): Maybe<SpellReference> {
    if (!this.canDrawSideboard(player)) return undefined;

    const spellReference = this.sideboardByPlayer.get(player)!.pop()!;
    this.handSizeByPlayer.set(player, (this.handSizeByPlayer.get(player) ?? 0) + 1);
    return spellReference;
  }

  /** `isOpponent` is absolute (the model's own side), not relative to a viewer. */
  public locate(model: CombatantModel): Maybe<{ position: DuelCirclePosition; isOpponent: boolean }> {
    const enemyIndex = this.enemies.findIndex(enemy => enemy.model === model);
    if (enemyIndex !== -1) return { position: enemyIndex as DuelCirclePosition, isOpponent: true };

    const playerIndex = this.players.findIndex(player => safeCast<CharacterModel>(player.Character) === model);
    if (playerIndex !== -1) return { position: playerIndex as DuelCirclePosition, isOpponent: false };

    return undefined;
  }

  /** Inverse of `locate`. */
  public combatantAt(position: DuelCirclePosition, isOpponent: boolean): Maybe<CombatantModel> {
    if (isOpponent) return this.enemies[position]?.model;

    const player = this.players[position];
    return player !== undefined ? safeCast<CharacterModel>(player.Character) : undefined;
  }

  /** Adds `percent` to `model`'s pending outgoing-damage bonus, consumed whole by their next `Damage.Hit` cast. */
  public addBlade(model: CombatantModel, percent: number): void {
    this.bladeBonusByModel.set(model, (this.bladeBonusByModel.get(model) ?? 0) + percent);
  }

  /** `model`'s current outgoing-damage multiplier (1 = no bonus) from any pending Blade, clearing it in the process - call once per damage cast so a Blade only boosts the next hit. */
  public consumeBladeMultiplier(model: CombatantModel): number {
    const percent = this.bladeBonusByModel.get(model) ?? 0;
    this.bladeBonusByModel.delete(model);
    return 1 + percent / 100;
  }

  public enemiesDefeated(): boolean {
    return this.enemies.size() > 0 && this.enemies.every(enemy => this.getHealth(enemy.model)?.isDefeated() ?? false);
  }

  public playersDefeated(): boolean {
    return this.players.every(player => {
      const character = safeCast<CharacterModel>(player.Character);
      return character === undefined || (this.getHealth(character)?.isDefeated() ?? false);
    });
  }

  /** Spends every ready player's chosen spell's pip cost - call once casting actually begins. Passing players, and any player without a character or pip tracker right now, are skipped. */
  public spendChosenPips(): void {
    for (const [player, choice] of this.choices) {
      if (choice === undefined) continue;

      const character = safeCast<CharacterModel>(player.Character);
      if (character === undefined) continue;

      this.getPips(character)?.spend(getSpellFromReference(choice.spellReference).cost);
    }
  }

  private moveIntoSlot(
    model: CombatantModel,
    positions: DuelCirclePositions,
    index: number,
    seedPips: (pips: CombatantPips) => void,
    maxHealth: number,
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
      this.healthByModel.set(model, new CombatantHealth(maxHealth));
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
