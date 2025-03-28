import { Dependency } from "@flamework/core";
import { Players, Workspace as World } from "@rbxts/services";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Timer } from "@rbxts/timer";
import { tween } from "@rbxts/instance-utility";
import { atom, subscribe } from "@rbxts/charm";
import type { BaseID } from "@rbxts/id";

import { Message, MessageData, messaging } from "shared/messaging";
import { assets, timerLength } from "shared/constants";
import { Enemy } from "./enemy";
import { DuelChoice, DuelCirclePosition, DuelPhase } from "shared/structs/duel";
import { CameraPoseKind } from "shared/structs/camera";
import { SpellReference } from "shared/structs/data/reference/spell";
import { Destroyable } from "shared/classes/destroyable";
import Log from "shared/log";

import type { EnemyService } from "server/services/enemy";
import type { DuelService } from "server/services/duel";

const MAX_COMBATANTS = 8;
const TURN_INFO = new TweenInfoBuilder()
  .SetTime(0.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();
const PULL_IN_INFO = new TweenInfoBuilder()
  .SetTime(1.5)
  .SetEasingStyle(Enum.EasingStyle.Linear)
  .Build();
const FADE_IN_INFO = new TweenInfoBuilder()
  .SetTime(0.4)
  .Build();
const FADE_OUT_INFO = new TweenInfoBuilder()
  .SetTime(1)
  .SetEasingStyle(Enum.EasingStyle.Cubic)
  .SetEasingDirection(Enum.EasingDirection.In)
  .Build();
const GLOW_INFO = new TweenInfoBuilder()
  .SetTime(0.5)
  .SetReverses(true)
  .Build();

export type Combatant = Player | Enemy;

type Pass = 0;

// TODO: max per-player enemies
export class DuelCircle<PvP extends boolean = boolean> extends Destroyable implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = DuelCircle.cumulativeID++;
  public readonly currentPhase = atom(DuelPhase.Start);
  public readonly opponentPositions: DuelCirclePositions;
  public readonly teamPositions: DuelCirclePositions;

  private readonly model: DuelCircleModel;
  private readonly occupiedOpponentPositions = new Set<DuelCirclePosition>;
  private readonly occupiedTeamPositions = new Set<DuelCirclePosition>;
  private readonly combatants = new Set<Combatant>;
  private readonly combatantChoices = new Map<Combatant, DuelChoice | Pass>;
  private readonly animations;
  private currentTimer?: Timer;

  /**
   * Creates a new duel circle and animates it.
   * @param location The location of the duel circle.
   * @param pvp Optional boolean indicating if the duel circle is for PvP.
   * If `true`, players may be placed in opponent positions and enemies can not enter. Defaults to `false`.
   */
  public constructor(
    private readonly duelService: DuelService,
    location: Vector3,
    private readonly pvp: PvP = false as PvP
  ) {
    super();

    this.model = this.janitor.Add(assets.duel.circle.Clone());
    this.model.PivotTo(new CFrame(location));
    this.model.Parent = World.DuelCircles;
    this.model.SetAttribute("ID", this.id);

    this.janitor.Add(() => DuelCircle.cumulativeID--);
    this.janitor.Add(subscribe(this.currentPhase, (phase, lastPhase) => {
      if (phase === lastPhase) return;
      this.emitToPlayers(Message.DuelPhaseChanged, phase);
    }));
    this.janitor.Add(() => this.currentPhase(DuelPhase.End));
    this.currentPhase(DuelPhase.Start);

    if (!pvp)
      this.janitor.Add(this.model.hitbox.Touched.Connect(hit => {
        const character = hit.FindFirstAncestorOfClass("Model");
        if (character === undefined) return;
        if (this.combatants.size() === MAX_COMBATANTS) return;
        this.onTouched(character);
      }));

    const animations = assets.animations.duel.circle;
    const animator = this.model.AnimationController.Animator;
    this.animations = {
      onAdd: animator.LoadAnimation(animations.combatantAdded),
      onRemove: animator.LoadAnimation(animations.combatantRemoved),
      idle: animator.LoadAnimation(animations.idle)
    };

    this.playCreationAnimation();
    this.animations.onRemove.Ended.Once(() => this.destroy());

    this.opponentPositions = this.model.opponentPositions;
    this.teamPositions = this.model.teamPositions;
  }

  /**
   * Submits a player's choice for the duel.
   * If all players have made a choice, transitions the duel circle to the combat phase.
   * @param player The player who made the choice.
   * @param choice The choice made, or undefined if they passed.
   */
  public submitPlayerChoice(player: Player, choice: Maybe<DuelChoice>): void {
    this.combatantChoices.set(player, choice ?? 0);
    if (!this.allCombatantsHaveChosen()) return;
    this.toCombatPhase();
  }

  /**
   * Adds a player to the duel circle, positioning them in either the team or opponent
   * positions depending on whether they are part of the enemy team.
   * @param player The player to add to the duel circle.
   * @param enemyTeam Optional boolean indicating if the player should be positioned
   * in the opponent positions. Only applicable if the duel circle is for PvP.
   * @returns A function that removes the player from the duel circle.
   */
  public addPlayer(player: Player, position: DuelCirclePosition): () => void
  public addPlayer(player: Player, position: DuelCirclePosition, enemyTeam?: PvP extends true ? boolean : undefined): () => void
  public addPlayer(player: Player, position: DuelCirclePosition, enemyTeam?: PvP extends true ? boolean : undefined): () => void {
    if (this.combatants.has(player))
      return () => { };

    const isOpponent = enemyTeam ?? false;
    const positions = isOpponent
      ? this.opponentPositions
      : this.teamPositions;
    const occupiedPositions = isOpponent
      ? this.occupiedOpponentPositions
      : this.occupiedTeamPositions;

    this.currentTimer?.setLength(1);
    this.currentTimer?.setLength(timerLength);
    occupiedPositions.add(position);
    this.addCombatant(player, isOpponent);

    messaging.emitClient(player, Message.ToggleMovement, false);
    messaging.emitClient(player, Message.DuelInitializeClient, {
      id: this.id,
      onOpposingTeam: this.occupiedOpponentPositions.has(position),
      opponentCount: this.occupiedOpponentPositions.size(),
      teamCount: this.occupiedTeamPositions.size()
    });
    this.pullInCombatant(player.Character!, positions, position, () =>
      messaging.emitClient(player, Message.TransitionCameraPose, {
        poseKind: CameraPoseKind.BattleAerial,
        duration: 0.4
      })
    );

    return this.janitor.Add(() => this.removeCombatant(player, position, isOpponent));
  }

  /**
   * Adds an enemy to the duel circle, positioning it in the enemy's position.
   * Throws if the duel circle is for PvP.
   * @param enemy The enemy to add
   * @returns A function that removes the enemy from the duel circle.
   */
  public addEnemy(enemy: Enemy, position: DuelCirclePosition): () => void {
    if (this.pvp)
      return Log.fatal("Attempt to add enemy to a PvP duel circle", ["duel circle"]);

    if (this.combatants.has(enemy))
      return () => { };

    this.occupiedOpponentPositions.add(position);
    this.addCombatant(enemy, true);
    this.pullInCombatant(enemy.model, this.opponentPositions, position);

    return this.janitor.Add(() => this.removeCombatant(enemy, position, true));
  }

  public override destroy(): void {
    if (this.destroyed) return;
    this.emitToPlayers(Message.ToggleMovement, true);

    this.animations.idle.Stop();
    this.animations.onRemove.Play(0);
    this.fadeOut().Completed.Once(() => this.janitor.Destroy());
  }

  private allCombatantsHaveChosen(): boolean {
    return this.combatantChoices.size() === this.combatants.size();
  }

  private addCombatant(combatant: Combatant, isOpponent: boolean): void {
    if (this.combatants.has(combatant)) return;
    this.combatants.add(combatant);
    this.duelService.combatantsInDuels.add(combatant);
    this.emitToPlayers(Message.DuelCombatantAdded, isOpponent);
  }

  private removeCombatant(combatant: Combatant, position: DuelCirclePosition, opponent: boolean): void {
    if (!this.combatants.has(combatant)) return;
    this.combatants.delete(combatant);
    this.duelService.combatantsInDuels.delete(combatant);
    const occupiedPositions = opponent
      ? this.occupiedOpponentPositions
      : this.occupiedTeamPositions;

    occupiedPositions.delete(position);
    this.emitToPlayers(Message.DuelCombatantRemoved, opponent);
  }

  private onTouched(character: Model): void {
    const isEnemy = character.HasTag("Enemy");
    if (isEnemy) {
      const enemies = Dependency<EnemyService>();
      const openPosition = this.getOpenOpponentPosition();
      if (openPosition === undefined) return;

      const id = character.GetAttribute<number>("ID")!;
      const enemy = enemies.findEnemyByID(id);
      if (enemy === undefined)
        return Log.warn(`Failed find enemy with ID ${id} while attempting to attract into duel circle`, ["duel circle"]);

      this.addEnemy(enemy, openPosition);
    } else {
      const player = Players.GetPlayerFromCharacter(character)!;
      const openPosition = this.getOpenTeamPosition();
      if (openPosition === undefined) return;
      this.addPlayer(player, openPosition);
    }
  }

  private getOpenOpponentPosition(): Maybe<DuelCirclePosition> {
    const size = this.occupiedOpponentPositions.size();
    if (size > DuelCirclePosition.Fourth) return;
    return size;
  }

  private getOpenTeamPosition(): Maybe<DuelCirclePosition> {
    const size = this.occupiedTeamPositions.size();
    if (size > DuelCirclePosition.Fourth) return;
    return size;
  }

  private getPlayerCombatants(): Player[] {
    return [...this.combatants].filter((combatant): combatant is Player => typeIs(combatant, "Instance") && combatant.IsA("Player"));
  }

  private getEnemyCombatants(): Enemy[] {
    return [...this.combatants].filter(combatant => combatant instanceof Enemy);
  }

  private start(): void {
    Log.info("Duel started")
    this.animations.onAdd.AdjustSpeed(0);
    this.animations.idle.Play(0);
    task.wait(0.5);
    this.currentPhase(DuelPhase.Planning);
    this.chooseEnemyCards()

    this.currentTimer = this.janitor.Add(new Timer(timerLength), "destroy");
    this.currentTimer.lengthChanged.Connect(length => {
      if (this.currentTimer === undefined) return;
      if (length === 1) return;

      this.currentTimer.stop();
      this.currentTimer.start();
      this.emitToPlayers(Message.DuelUpdateTimer, length);
    });
    this.currentTimer.completed.Connect(() => this.toCombatPhase());
    this.currentTimer.start();
  }

  private toCombatPhase(): void {
    this.currentPhase(DuelPhase.Combat);
    this.currentTimer?.destroy();
    this.combatantChoices.clear();
  }

  private chooseEnemyCards(): void {
    const enemies = this.getEnemyCombatants();
    // TODO: this

    for (const enemy of enemies) {
      // temporary; enemy.ai.getChoice() or something w/ some params regarding context of the duel
      this.combatantChoices.set(enemy, {
        spellReference: SpellReference.Myth_Mythblade,
        target: DuelCirclePosition.First,
        targetIsOpponent: true
      });
    }
  }

  private pullInCombatant(combatantModel: Model, positions: DuelCirclePositions, position: DuelCirclePosition, onCompleted?: () => void): void {
    const positionPart = positions[tostring(position + 1) as ExtractKeys<DuelCirclePositions, Part>];
    const height = combatantModel.GetBoundingBox()[1].Y;
    const root = combatantModel.PrimaryPart!;

    root.Anchored = true;
    this.janitor.Add(() => root.Anchored = false);

    const [x, y, z] = new CFrame(root.Position, positionPart.Position).ToOrientation();
    tween(root, TURN_INFO, { Orientation: new Vector3(x, y, z) })
    tween(root, PULL_IN_INFO, {
      Position: positionPart.Position.add(new Vector3(0, height / 2, 0))
    }).Completed.Once(() =>
      tween(root, TURN_INFO, { Orientation: positionPart.Orientation })
        .Completed.Once(() => onCompleted?.())
    );
  }

  private playCreationAnimation(): void {
    this.fadeIn();
    const conn = this.animations.onAdd.KeyframeReached.Connect(kf => {
      if (kf !== "Final") return;
      conn.Disconnect();
      this.start();
    });

    this.animations.onAdd.Play(0);
  }

  private fadeIn(): void {
    this.model.Main.texture.Transparency = 1;
    this.model.Vortex.texture.Transparency = 1;
    this.model.Glow.texture.Transparency = 1;

    tween(this.model.Main.texture, FADE_IN_INFO, { Transparency: 0 });
    tween(this.model.Vortex.texture, FADE_IN_INFO, { Transparency: 0 });
    tween(this.model.Glow.texture, GLOW_INFO, { Transparency: 0.3 });
  }

  private fadeOut(): Tween {
    tween(this.model.Main.texture, FADE_OUT_INFO, { Transparency: 1 });
    return tween(this.model.Vortex.texture, FADE_OUT_INFO, { Transparency: 1 });
  }

  private emitToPlayers<Kind extends Message>(message: Kind, data?: MessageData[Kind]): void {
    messaging.emitClient(this.getPlayerCombatants(), message, data);
  }
}