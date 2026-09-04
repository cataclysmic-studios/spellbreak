import { Dependency, Service } from "@flamework/core";
import { Players, Workspace as World } from "@rbxts/services";
import { safeCast } from "@rbxts/flamework-meta-utils";

import { assets, duelCameraTransitionDuration, duelCastingFocusDelay, duelCircleSpawnOffset, XZ } from "shared/constants";
import { messaging, Message, type MessageData } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { CameraPoseKind } from "shared/structs/camera";
import { getClosestDuelCircleLocation, getShuffledHand, playCircleIdleAnimation, playCircleSpawnAnimation } from "shared/utility/duel";
import { getZoneModel } from "shared/utility/zone";
import { ActiveDuel } from "server/classes/duel";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { EnemyService } from "./enemy";
import type { ZoneService } from "./zone";
import type { Enemy } from "server/classes/enemy";

const log = Log.scoped("duel service");

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
    duel.addPlayer(player, character, this.database.getCharacter(player).stats.powerPipChance, false);
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
        duel.addPlayer(player, character, this.database.getCharacter(player).stats.powerPipChance, true);
        return;
      }

      const enemy = Dependency<EnemyService>().findEnemyFromTouch(hit);
      if (enemy === undefined || this.duelsByEnemy.has(enemy) || !duel.hasRoomForEnemy()) return;

      log.info(`${enemy.descriptor.name} joining forming duel #${duel.id} via the circle`);
      this.duelsByEnemy.set(enemy, duel);
      duel.addEnemy(enemy, true);
    });

    duel.onceLockedIn(() => connection.Disconnect());
  }

  /** The duel's combatant list is locked in - sends every player their hand and starts easing their camera into the planning pose. */
  private beginPlanning(duel: ActiveDuel): void {
    for (const player of duel.players) {
      const hand = getShuffledHand(this.database.getCharacter(player));
      const character = safeCast<CharacterModel>(player.Character);
      const pipValue = character !== undefined ? duel.getPips(character)?.getValue() ?? 0 : 0;
      messaging.client.emit(player, Message.Duel_Start, {
        id: duel.id,
        model: duel.circle,
        onOpposingTeam: false,
        firstTurnOnTeam: duel.firstTurnOnTeam,
        opponentCount: duel.enemies.size(),
        teamCount: duel.players.size(),
        pipValue,
        hand
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
  }

  /**
   * A combatant locked in their choice for the round (passing counts). Once every player in the
   * duel has (the enemy side doesn't make real choices yet), spends everyone's chosen spell's pip
   * cost, then tells every player to drop the planning UI and ease into the casting overview
   * camera - hovering above their corner of the circle, looking at its center. Once the first
   * caster's cast animation would start (`duelCastingFocusDelay` later), the camera eases in
   * again to focus on them.
   * @hidden
   */
  @OnServerMessage(Message.Duel_ChoiceMade)
  public onChoiceMade(player: Player, { id, spellReference }: MessageData[Message.Duel_ChoiceMade]): void {
    const duel = this.duelsByID.get(id);
    if (duel === undefined || !duel.locked || !duel.players.includes(player) || duel.choices.has(player)) return;

    duel.choices.set(player, spellReference);
    if (duel.choices.size() < duel.players.size()) return;

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
    });
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
