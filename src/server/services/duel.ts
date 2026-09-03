import { Service } from "@flamework/core";
import { Players, Workspace as World } from "@rbxts/services";
import { safeCast } from "@rbxts/flamework-meta-utils";

import { assets, duelCameraTransitionDuration, duelCastingFocusDelay, duelCircleSpawnOffset, XZ } from "shared/constants";
import { messaging, Message } from "shared/messaging";
import { OnServerMessage } from "shared/meta";
import { CameraPoseKind } from "shared/structs/camera";
import { getClosestDuelCircleLocation, getShuffledHand, playCircleIdleAnimation, playCircleSpawnAnimation } from "shared/utility/duel";
import { ActiveDuel } from "server/classes/duel";
import Log from "shared/log";

import type { DatabaseService } from "./database";
import type { Enemy } from "server/classes/enemy";

const log = Log.scoped("duel service");

@Service()
export class DuelService {
  private cumulativeID = 0;
  private readonly duelsByID = new Map<number, ActiveDuel>();
  private readonly duelsByPlayer = new Map<Player, ActiveDuel>();

  public constructor(
    private readonly database: DatabaseService
  ) { }

  /**
   * `enemy` touched `player`. If `player` is already in a duel that's still forming (hasn't
   * locked its combatant list in yet), `enemy` just joins it instead of a second circle getting
   * spawned on top of the first - this is what keeps touching two enemies at once (or one enemy
   * wandering into an already-forming duel) from creating overlapping circles/pointers. Otherwise
   * this places a brand new circle and starts the two of them approaching it.
   */
  public startDuel(player: Player, enemy: Enemy): void {
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
      forming.addEnemy(enemy, true);
      return;
    }

    const character = safeCast<CharacterModel>(player.Character);
    if (character === undefined) {
      log.warn(`Cannot start duel: ${player.Name} has no character`);
      return;
    }

    const circle = this.placeDuelCircle(character, enemy);
    playCircleSpawnAnimation(circle);
    playCircleIdleAnimation(circle);

    const duel = new ActiveDuel(this.cumulativeID++, circle);
    this.duelsByID.set(duel.id, duel);
    this.duelsByPlayer.set(player, duel);
    duel.onceLockedIn(lockedDuel => this.beginPlanning(lockedDuel));
    this.wirePlayerJoinByTouch(duel);

    messaging.client.emit(player, Message.Movement_Toggle, false);

    // Founding combatants - no join effect for either of them.
    duel.addPlayer(player, character, false);
    duel.addEnemy(enemy, false);
  }

  /** Lets a second (and third, fourth...) player join a still-forming duel by walking into its circle's hitbox, same as another enemy joining by touching the player. */
  private wirePlayerJoinByTouch(duel: ActiveDuel): void {
    const connection = duel.circle.hitbox.Touched.Connect(hit => {
      if (duel.locked) return connection.Disconnect();

      const player = Players.GetPlayerFromCharacter(hit.FindFirstAncestorOfClass("Model"));
      if (player === undefined || this.duelsByPlayer.has(player)) return;
      if (!duel.hasRoomForPlayer()) return;

      const character = safeCast<CharacterModel>(player.Character);
      if (character === undefined) return;

      log.info(`${player.Name} joining forming duel #${duel.id} via the circle`);
      this.duelsByPlayer.set(player, duel);
      messaging.client.emit(player, Message.Movement_Toggle, false);
      duel.addPlayer(player, character, true);
    });

    duel.onceLockedIn(() => connection.Disconnect());
  }

  /** The duel's combatant list is locked in - sends every player their hand and starts easing their camera into the planning pose. */
  private beginPlanning(duel: ActiveDuel): void {
    for (const player of duel.players) {
      const hand = getShuffledHand(this.database.getCharacter(player));
      messaging.client.emit(player, Message.Duel_Start, {
        id: duel.id,
        model: duel.circle,
        onOpposingTeam: false,
        firstTurnOnTeam: duel.firstTurnOnTeam,
        opponentCount: duel.enemies.size(),
        teamCount: duel.players.size(),
        hand
      });
      messaging.client.emit(player, Message.Camera_TransitionPose, {
        poseKind: CameraPoseKind.DuelPlanning,
        duration: duelCameraTransitionDuration
      });
    }
  }

  /**
   * A combatant locked in their choice for the round (passing counts). Once every player in the
   * duel has (the enemy side doesn't make real choices yet), tells every player to drop the
   * planning UI and ease into the casting overview camera - hovering above their corner of the
   * circle, looking at its center. Once the first caster's cast animation would start
   * (`duelCastingFocusDelay` later), the camera eases in again to focus on them.
   * @hidden
   */
  @OnServerMessage(Message.Duel_ChoiceMade)
  public onChoiceMade(player: Player, id: number): void {
    const duel = this.duelsByID.get(id);
    if (duel === undefined || !duel.locked || !duel.players.includes(player) || duel.readyPlayers.has(player)) return;

    duel.readyPlayers.add(player);
    if (duel.readyPlayers.size() < duel.players.size()) return;

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
  private placeDuelCircle(character: CharacterModel, enemy: Enemy): DuelCircleModel {
    const circle = assets.duel.circle.Clone();
    const playerPosition = character.collider.Position;
    const enemyPosition = enemy.root.Position;
    const midpoint = playerPosition.Lerp(enemyPosition, 0.5);

    const location = getClosestDuelCircleLocation(midpoint);
    const desiredRootCFrame = location?.CFrame ?? this.fallbackCircleCFrame(character, enemy);

    // Move the whole model by the same delta needed to bring `Root` to its target CFrame,
    // rather than relying on `PrimaryPart`/`PivotTo` alone, since the model's Root may or
    // may not be its configured pivot.
    const delta = desiredRootCFrame.mul(circle.Root.CFrame.Inverse());
    circle.PivotTo(delta.mul(circle.GetPivot()));
    circle.Parent = World.DuelCircles;

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
