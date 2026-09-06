import { Dependency, Service } from "@flamework/core";
import { Players, Workspace as World } from "@rbxts/services";
import { safeCast } from "@rbxts/flamework-meta-utils";
import { Range, type RangeJSON } from "@rbxts/range";

import {
  assets, duelCameraTransitionDuration, duelCastingFocusDelay, duelCastResolutionPause,
  duelCircleSpawnOffset, duelPipsPerRound, XZ
} from "shared/constants";
import { messaging, Message, type MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { CameraPoseKind } from "shared/structs/camera";
import { DuelCirclePosition, type DuelChoice } from "shared/structs/duel";
import { SpellActionKind } from "shared/structs/spell/actions";
import { SpellTargetKind } from "shared/structs/spell";
import { getClosestDuelCircleLocation, getDeckSideboard, getShuffledHand, playCircleIdleAnimation, playCircleSpawnAnimation } from "shared/utility/duel";
import { getSpellFromReference } from "shared/utility/spell";
import { getZoneModel } from "shared/utility/zone";
import { ActiveDuel } from "server/classes/duel";
import { chooseEnemyCast } from "server/utility/enemy-cast-ai";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { EnemyService } from "./enemy";
import type { ZoneService } from "./zone";
import type { DuelCombatant } from "server/classes/duel";
import type { Enemy } from "server/classes/enemy";
import type { Spell } from "shared/structs/spell";
import type { SpellAction } from "shared/structs/spell/actions";
import type { DuelCastTargetResult } from "shared/structs/packets";

const log = Log.scoped("duel service");

interface QueuedCast {
  readonly caster: DuelCombatant;
  readonly choice: DuelChoice;
}

@Service()
export class DuelService {
  private cumulativeID = 0;
  private readonly duelsByID = new Map<number, ActiveDuel>();
  private readonly duelsByPlayer = new Map<Player, ActiveDuel>();
  private readonly duelsByEnemy = new Map<Enemy, ActiveDuel>();

  public constructor(
    private readonly database: DatabaseService,
    private readonly zone: ZoneService
  ) { }

  /**
   * `enemy` touched `player`. If `player` is already in a duel that's still forming (hasn't
   * locked its combatant list in yet), `enemy` just joins it instead of a second circle getting
   * spawned on top of the first - this is what keeps touching two enemies at once (or one enemy
   * wandering into an already-forming duel) from creating overlapping circles/pointers. Otherwise
   * this places a brand new circle and starts the two of them approaching it.
   */
  public startDuel(player: Player, enemy: Enemy): void {
    if (this.duelsByEnemy.has(enemy)) return;

    const forming = this.duelsByPlayer.get(player);
    if (forming !== undefined) {
      if (forming.locked) {
        log.debug(`${player.Name} is already mid-duel (#${forming.id}) - ignoring touch from ${enemy.descriptor.name}`);
        return;
      }
      if (!forming.hasRoomForEnemy()) {
        log.warn(`Duel #${forming.id}'s opponent side is full - ${enemy.descriptor.name} can't join`);
        return;
      }

      log.info(`${enemy.descriptor.name} joining ${player.Name}'s forming duel (#${forming.id})`);
      this.duelsByEnemy.set(enemy, forming);
      enemy.dueling = true;
      enemy.stopMoving();
      forming.addEnemy(enemy, true);
      return;
    }

    const character = safeCast<CharacterModel>(player.Character);
    if (character === undefined) {
      log.warn(`Cannot start duel: ${player.Name} has no character`);
      return;
    }

    const circle = this.placeDuelCircle(player, character, enemy);
    playCircleSpawnAnimation(circle);
    playCircleIdleAnimation(circle);

    const duel = new ActiveDuel(this.cumulativeID++, circle);
    this.duelsByID.set(duel.id, duel);
    this.duelsByPlayer.set(player, duel);
    this.duelsByEnemy.set(enemy, duel);
    duel.onceLockedIn(lockedDuel => this.beginPlanning(lockedDuel));
    this.wireCircleTouch(duel);

    messaging.client.emit(player, Message.Movement_Toggle, false);

    // Founding combatants - no join effect for either of them.
    const stats = this.database.getCharacter(player).stats;
    duel.addPlayer(player, character, stats.powerPipChance, stats.maxHealth, false);
    enemy.dueling = true;
    enemy.stopMoving();
    duel.addEnemy(enemy, false);
  }

  /**
   * Lets any player or enemy still outside a still-forming duel join it just by touching its
   * circle's hitbox - covers a second (and third, fourth...) player walking in, as well as any
   * enemy that's standing on or wanders onto the circle without ever having touched a player
   * directly (an enemy's own touch-detection collider is one-shot, so an enemy that spawns
   * already overlapping the circle, or that the founding touch never targeted, would otherwise
   * never get pulled into the duel).
   */
  private wireCircleTouch(duel: ActiveDuel): void {
    const connection = duel.circle.hitbox.Touched.Connect(hit => {
      if (duel.locked) return connection.Disconnect();

      const touchedModel = hit.FindFirstAncestorOfClass("Model");
      const player = Players.GetPlayerFromCharacter(touchedModel);
      if (player !== undefined) {
        if (this.duelsByPlayer.has(player) || !duel.hasRoomForPlayer()) return;

        const character = safeCast<CharacterModel>(player.Character);
        if (character === undefined) return;

        log.info(`${player.Name} joining forming duel #${duel.id} via the circle`);
        this.duelsByPlayer.set(player, duel);
        messaging.client.emit(player, Message.Movement_Toggle, false);
        const stats = this.database.getCharacter(player).stats;
        duel.addPlayer(player, character, stats.powerPipChance, stats.maxHealth, true);
        return;
      }

      const enemy = Dependency<EnemyService>().findEnemyFromTouch(hit);
      if (enemy === undefined || this.duelsByEnemy.has(enemy) || !duel.hasRoomForEnemy()) return;

      log.info(`${enemy.descriptor.name} joining forming duel #${duel.id} via the circle`);
      this.duelsByEnemy.set(enemy, duel);
      enemy.dueling = true;
      enemy.stopMoving();
      duel.addEnemy(enemy, true);
    });

    duel.onceLockedIn(() => connection.Disconnect());
  }

  /** The duel's combatant list is locked in - sends every player their hand and starts easing their camera into the planning pose. */
  private beginPlanning(duel: ActiveDuel): void {
    for (const player of duel.players) {
      const character = this.database.getCharacter(player);
      const hand = getShuffledHand(character);
      duel.seedDeckState(player, hand.size(), getDeckSideboard(character));

      const model = safeCast<CharacterModel>(player.Character);
      const pipValue = model !== undefined ? duel.getPips(model)?.getValue() ?? 0 : 0;
      messaging.client.emit(player, Message.Duel_Start, {
        id: duel.id,
        model: duel.circle,
        onOpposingTeam: false,
        firstTurnOnTeam: duel.firstTurnOnTeam,
        opponentCount: duel.enemies.size(),
        teamCount: duel.players.size(),
        pipValue,
        hand,
        sideboardCount: duel.getSideboardCount(player)
      });
      messaging.client.emit(player, Message.Camera_TransitionPose, {
        poseKind: CameraPoseKind.DuelPlanning,
        duration: duelCameraTransitionDuration
      });
    }

    // Reveal pips once the camera's actually finished easing into the planning pose - same
    // timing as when the client's DuelPlanning subview appears (see UIController.showDuelPlanning,
    // gated on CameraController.transitionCompleted).
    task.delay(duelCameraTransitionDuration, () => duel.revealPips());
    this.seedEnemyChoices(duel);
  }

  /** Enemies decide their cast the instant a round starts (rather than waiting on player input) - there's no client round-trip for them, and it's what lets `onChoiceMade`'s gating check below ever see every combatant's choice in. Already-defeated enemies pass. */
  private seedEnemyChoices(duel: ActiveDuel): void {
    for (const enemy of duel.enemies) {
      if (duel.getHealth(enemy.model)?.isDefeated()) continue;

      const choice = chooseEnemyCast(enemy, duel);
      duel.choices.set(enemy, choice);
      log.debug(`${enemy.descriptor.name} (duel #${duel.id}) ${choice !== undefined ? `casts "${getSpellFromReference(choice.spellReference).name}"` : "passes"}`);
    }
  }

  /**
   * A player locked in their choice for the round (passing counts). Enemy choices are already
   * seeded in by `seedEnemyChoices` the moment the round started, so once every player has too,
   * this spends everyone's chosen spell's pip cost, then tells every player to drop the planning
   * UI and ease into the casting overview camera - hovering above their corner of the circle,
   * looking at its center. Once the first caster's cast animation would start
   * (`duelCastingFocusDelay` later), the camera eases in again to focus on them, and the round
   * resolves `duelCastResolutionPause` after that (a placeholder for real per-cast animation timing).
   * @hidden
   */
  @OnServerMessage(Message.Duel_ChoiceMade)
  public onChoiceMade(player: Player, { id, spellReference, target, targetIsOpponent }: MessageData[Message.Duel_ChoiceMade]): void {
    const duel = this.duelsByID.get(id);
    if (duel === undefined || !duel.locked || !duel.players.includes(player) || duel.choices.has(player)) return;

    duel.choices.set(player, spellReference === undefined ? undefined : { spellReference, target: target as Maybe<DuelCirclePosition>, targetIsOpponent });
    if (duel.choices.size() < duel.players.size() + duel.enemies.size()) return;

    duel.spendChosenPips();
    for (const p of duel.players) {
      messaging.client.emit(p, Message.Duel_BeginCasting, id);
      messaging.client.emit(p, Message.Camera_TransitionPose, {
        poseKind: CameraPoseKind.DuelCastingOverview,
        duration: duelCameraTransitionDuration
      });
    }

    task.delay(duelCastingFocusDelay, () => {
      for (const p of duel.players) {
        messaging.client.emit(p, Message.Camera_TransitionPose, {
          poseKind: CameraPoseKind.DuelCasting,
          duration: duelCameraTransitionDuration
        });
      }

      task.delay(duelCameraTransitionDuration + duelCastResolutionPause, () => this.resolveRound(duel));
    });
  }

  /** A player asked to draw their next sideboard treasure card - re-validates against the duel's own tracked hand size/sideboard rather than trusting the client's button state. Silently no-ops if they can't right now. */
  @OnServerMessage(Message.Duel_DrawSideboard)
  public onDrawSideboard(player: Player, id: MessageData[Message.Duel_DrawSideboard]): void {
    const duel = this.duelsByID.get(id);
    if (duel === undefined || !duel.locked || !duel.players.includes(player)) return;

    const spellReference = duel.drawSideboard(player);
    if (spellReference === undefined) return;

    messaging.client.emit(player, Message.Duel_SideboardDrawn, {
      id,
      spellReference,
      sideboardRemaining: duel.getSideboardCount(player)
    });
  }

  private resolveRound(duel: ActiveDuel): void {
    for (const cast of this.buildCastQueue(duel)) this.resolveCast(duel, cast);
    duel.choices.clear();

    const enemiesDefeated = duel.enemiesDefeated();
    const playersDefeated = duel.playersDefeated();
    if (enemiesDefeated || playersDefeated) {
      this.endDuel(duel, enemiesDefeated);
      return;
    }

    this.beginNextRound(duel);
  }

  private buildCastQueue(duel: ActiveDuel): QueuedCast[] {
    const queued: QueuedCast[] = [];
    for (const [caster, choice] of duel.choices)
      if (choice !== undefined) queued.push({ caster, choice });

    return queued.sort((a, b) => {
      const spellA = getSpellFromReference(a.choice.spellReference);
      const spellB = getSpellFromReference(b.choice.spellReference);
      const costA = spellA.cost.pips === "X" ? math.huge : spellA.cost.pips;
      const costB = spellB.cost.pips === "X" ? math.huge : spellB.cost.pips;

      // Lowest pip cost first, ties broken by higher accuracy.
      return costA === costB ? spellA.accuracy > spellB.accuracy : costA < costB;
    });
  }

  /** Only `Damage.Hit` and `Buff.Blade` are resolved so far - every other action kind is skipped with a warning. */
  private resolveCast(duel: ActiveDuel, { caster, choice }: QueuedCast): void {
    const casterModel = duel.modelOf(caster);
    const casterLocation = casterModel !== undefined ? duel.locate(casterModel) : undefined;
    if (casterModel === undefined || casterLocation === undefined) return;

    const spell = getSpellFromReference(choice.spellReference);
    const targets = this.resolveTargets(duel, spell, choice);
    if (spell.hasTarget && targets.size() === 0) return;

    const results: DuelCastTargetResult[] = [];
    for (const action of spell.actions) {
      if (action.kind === SpellActionKind.Damage.Hit) {
        for (const targetModel of targets) results.push(this.resolveDamage(duel, casterModel, targetModel, spell, action));
      } else if (action.kind === SpellActionKind.Buff.Blade) {
        for (const targetModel of targets) duel.addBlade(targetModel, action.value as number);
      } else {
        log.warn(`"${spell.name}"'s ${action.kind} action isn't resolved yet - skipping`);
      }
    }

    for (const p of duel.players)
      messaging.client.emit(p, Message.Duel_CastResolved, {
        id: duel.id,
        casterPosition: casterLocation.position,
        casterIsOpponent: casterLocation.isOpponent,
        spellReference: choice.spellReference,
        results
      });
  }

  /** `MultipleEnemies` AOE targeting isn't handled here yet. */
  private resolveTargets(duel: ActiveDuel, spell: Spell, choice: DuelChoice): CombatantModel[] {
    if (!spell.hasTarget || choice.target === undefined || choice.targetIsOpponent === undefined) return [];
    if (spell.targetKind === SpellTargetKind.MultipleEnemies) {
      log.warn(`"${spell.name}" is an AOE spell - AOE targeting isn't resolved yet, skipping`);
      return [];
    }

    const target = duel.combatantAt(choice.target as DuelCirclePosition, choice.targetIsOpponent);
    return target !== undefined ? [target] : [];
  }

  private resolveDamage(duel: ActiveDuel, casterModel: CombatantModel, targetModel: CombatantModel, spell: Spell, action: SpellAction): DuelCastTargetResult {
    const targetLocation = duel.locate(targetModel);
    const health = duel.getHealth(targetModel);
    const hit = math.random() * 100 < spell.accuracy;

    if (targetLocation === undefined) return { targetPosition: 0, targetIsOpponent: false, missed: true };
    if (!hit || health === undefined) return { targetPosition: targetLocation.position, targetIsOpponent: targetLocation.isOpponent, missed: true };

    const multiplier = duel.consumeBladeMultiplier(casterModel);
    const rolled = Range.fromJSON(action.value as RangeJSON).randomInteger();
    const damage = health.damage(math.floor(rolled * multiplier));

    return { targetPosition: targetLocation.position, targetIsOpponent: targetLocation.isOpponent, missed: false, damage };
  }

  private beginNextRound(duel: ActiveDuel): void {
    for (const player of duel.players) {
      const character = safeCast<CharacterModel>(player.Character);
      if (character !== undefined) duel.getPips(character)?.add(false, duelPipsPerRound);
    }
    for (const enemy of duel.enemies) duel.getPips(enemy.model)?.add(false, duelPipsPerRound);
    this.seedEnemyChoices(duel);

    for (const player of duel.players) {
      const character = safeCast<CharacterModel>(player.Character);
      const pipValue = character !== undefined ? duel.getPips(character)?.getValue() ?? 0 : 0;
      messaging.client.emit(player, Message.Duel_NextRound, { id: duel.id, pipValue });
      messaging.client.emit(player, Message.Camera_TransitionPose, {
        poseKind: CameraPoseKind.DuelPlanning,
        duration: duelCameraTransitionDuration
      });
    }
  }

  /** A defeated enemy is removed from the world outright; a defeated player side just lets its enemies resume patrolling. */
  private endDuel(duel: ActiveDuel, victory: boolean): void {
    this.duelsByID.delete(duel.id);
    for (const player of duel.players) this.duelsByPlayer.delete(player);
    for (const enemy of duel.enemies) this.duelsByEnemy.delete(enemy);

    if (victory) {
      const enemyService = Dependency<EnemyService>();
      for (const enemy of duel.enemies) enemyService.removeEnemy(enemy);
    } else {
      for (const enemy of duel.enemies) enemy.dueling = false;
    }

    for (const player of duel.players) {
      messaging.client.emit(player, Message.Duel_Ended, { id: duel.id, victory });
      messaging.client.emit(player, Message.Camera_TransitionPose, {
        poseKind: CameraPoseKind.Character,
        duration: duelCameraTransitionDuration
      });
      messaging.client.emit(player, Message.Movement_Toggle, true);
    }

    log.info(`Duel #${duel.id} ended - ${victory ? "victory" : "defeat"}`);
  }

  /**
   * Clones the duel circle template so its `Root` sits at the `Workspace.DuelCircleLocations`
   * marker closest to the two combatants, using that marker's exact CFrame (position and
   * facing) as authored in Studio. Falls back to a fixed offset in front of the player (along
   * their facing direction), snapped down onto the ground, if no markers have been placed yet -
   * the enemy's position at the moment of the triggering touch is right against the player's,
   * so a plain midpoint would place the circle inside the player instead of out in front of
   * them, and `collider.Position` sits at the player's center of mass rather than ground level.
   */
  private placeDuelCircle(player: Player, character: CharacterModel, enemy: Enemy): DuelCircleModel {
    const circle = assets.duel.circle.Clone();
    const playerPosition = character.collider.Position;
    const enemyPosition = enemy.root.Position;
    const midpoint = playerPosition.Lerp(enemyPosition, 0.5);
    const zoneID = this.zone.getCurrentZone(player);

    const location = getClosestDuelCircleLocation(zoneID, midpoint);
    const desiredRootCFrame = location?.CFrame ?? this.fallbackCircleCFrame(character, enemy);

    // Move the whole model by the same delta needed to bring `Root` to its target CFrame,
    // rather than relying on `PrimaryPart`/`PivotTo` alone, since the model's Root may or
    // may not be its configured pivot.
    const delta = desiredRootCFrame.mul(circle.Root.CFrame.Inverse());
    circle.PivotTo(delta.mul(circle.GetPivot()));
    circle.Parent = getZoneModel(zoneID).DuelCircles;

    return circle;
  }

  private fallbackCircleCFrame(character: CharacterModel, enemy: Enemy): CFrame {
    const playerPosition = character.collider.Position;
    const facing = character.collider.CFrame.LookVector.mul(XZ);
    const facingUnit = facing.Magnitude > 0.01 ? facing.Unit : facing;
    const spawnPosition = this.groundPosition(playerPosition.add(facingUnit.mul(duelCircleSpawnOffset)), [character, enemy.model]);

    return facing.Magnitude > 0.01
      ? CFrame.lookAt(spawnPosition, spawnPosition.add(facing))
      : new CFrame(spawnPosition);
  }

  /** Raycasts straight down from above `position` to find the ground below it, ignoring `ignore`. Falls back to `position` unchanged if nothing is hit. */
  private groundPosition(position: Vector3, ignore: Instance[]): Vector3 {
    const origin = position.add(new Vector3(0, 10, 0));
    const params = new RaycastParams();
    params.FilterType = Enum.RaycastFilterType.Exclude;
    params.FilterDescendantsInstances = ignore;

    const result = World.Raycast(origin, new Vector3(0, -50, 0), params);
    return result === undefined ? position : new Vector3(position.X, result.Position.Y, position.Z);
  }
}
