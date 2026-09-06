import { CollectionService, Players, RunService, Workspace as World } from "@rbxts/services";
import type { BaseID } from "@rbxts/id";
import Signal from "@rbxts/lemon-signal";
import Vide from "@rbxts/vide";

import { assets, XZ } from "shared/constants";
import { ENEMY_TAG } from "shared/utility/enemy";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { NamedNPC } from "./named-npc";
import { EnemyNametag } from "shared/ui/components/enemy-nametag";

const SPEED = 3; // studs per second

// Throttles patrol CFrame writes below Heartbeat rate - each write replicates to every nearby
// client, and at 3 studs/sec a 12Hz step (~0.25 studs) is visually indistinguishable from 60Hz
// while cutting patrol-driven network traffic by ~80%.
const NETWORK_UPDATE_INTERVAL = 1 / 12;

export class Enemy extends NamedNPC<EnemyModel> implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = Enemy.cumulativeID++;
  /** Fires once, the first time a player touches this enemy, with the player who touched it. */
  public readonly touchedByPlayer = new Signal<(player: Player) => void>;
  /** Set once this enemy's joined a duel - `EnemyPathLoop` stops advancing its patrol while this is true. */
  public dueling = false;

  private moveConnection?: RBXScriptConnection;

  public constructor(public readonly descriptor: EnemyDescriptor) {
    super(
      assets.enemies.WaitForChild(descriptor.name).Clone() as never,
      () => <EnemyNametag descriptor={descriptor} />
    );

    this.model.SetAttribute("ID", this.id);
    this.model.SetAttribute("EnemyID", descriptor.id);
    CollectionService.AddTag(this.model, ENEMY_TAG);
    this.registerTouch();
  }

  /**
   * Timed off `os.clock()` elapsed-since-start rather than accumulating `dt` per frame - the
   * previous per-frame `SPEED / dt` step moved far too fast on any low-`dt` frame.
   *
   * Grounds the destination the same way `teleport` does - `part.Position` alone sinks the
   * enemy to the node's own center height rather than standing on top of it.
   */
  public moveTo(part: BasePart, onCompleted?: () => void): void {
    this.moveConnection?.Disconnect();

    const [, size] = this.model.GetBoundingBox();
    const newPosition = part.Position.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0));
    const startPosition = this.root.Position;
    const offset = newPosition.sub(startPosition);
    const distance = offset.Magnitude;
    if (distance < 0.01) {
      onCompleted?.();
      return;
    }

    const facingDirection = offset.mul(XZ);
    const facing = facingDirection.Magnitude > 0.01
      ? CFrame.lookAt(Vector3.zero, facingDirection)
      : this.root.CFrame.sub(startPosition);

    const duration = distance / SPEED;
    const startTime = os.clock();
    let lastUpdate = 0;

    this.moveConnection = RunService.Heartbeat.Connect(() => {
      const now = os.clock();
      const progress = math.clamp((now - startTime) / duration, 0, 1);
      const finished = progress >= 1;

      if (finished || now - lastUpdate >= NETWORK_UPDATE_INTERVAL) {
        lastUpdate = now;
        this.root.CFrame = new CFrame(startPosition.Lerp(newPosition, progress)).mul(facing);
      }

      if (finished) {
        this.moveConnection!.Disconnect();
        this.moveConnection = undefined;
        onCompleted?.();
      }
    });
  }

  /** Halts any in-progress `moveTo`, leaving the enemy wherever it currently stands - call before handing positioning off to something else (e.g. a duel), so patrol movement can't keep overwriting `root`'s CFrame every frame and fighting it. */
  public stopMoving(): void {
    this.moveConnection?.Disconnect();
    this.moveConnection = undefined;
  }

  public teleport(part: BasePart): void {
    const [_, size] = this.model.GetBoundingBox();
    this.model.PivotTo(part.CFrame.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0)));
    this.model.Parent = World;
  }

  private registerTouch(): void {
    const conn = this.model.collider.Touched.Connect(hit => {
      const playerWhoTouched = Players.GetPlayerFromCharacter(hit.FindFirstAncestorOfClass("Model"));
      if (playerWhoTouched === undefined) return;
      conn.Disconnect();

      this.touchedByPlayer.Fire(playerWhoTouched);
    });
  }
}