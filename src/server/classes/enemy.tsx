import { Players, RunService, Workspace as World } from "@rbxts/services";
import type { BaseID } from "@rbxts/id";
import Vide from "@rbxts/vide";

import { assets } from "shared/constants";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { NamedNPC } from "./named-npc";
import { EnemyNametag } from "shared/ui/components/enemy-nametag";

const SPEED = 3; // studs per second

export class Enemy extends NamedNPC<EnemyModel> implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = Enemy.cumulativeID++;
  private moveConnection?: RBXScriptConnection;

  public constructor(descriptor: EnemyDescriptor) {
    super(
      assets.enemies.WaitForChild(descriptor.name).Clone() as never,
      () => <EnemyNametag descriptor={descriptor} />
    );

    this.model.SetAttribute("ID", this.id);
    this.registerTouch();
  }

  public moveTo(newPosition: Vector3): void {
    this.moveConnection?.Disconnect();

    const direction = newPosition.sub(this.root.Position).Unit;
    const distance = this.root.Position.sub(newPosition).Magnitude;
    const duration = distance / SPEED;
    const startTime = os.clock();

    this.moveConnection = RunService.Heartbeat.Connect(dt => {
      const elapsed = os.clock() - startTime;
      if (elapsed >= duration) {
        this.root.CFrame = new CFrame(newPosition);
        return this.moveConnection!.Disconnect();
      }

      this.root.CFrame = this.root.CFrame.add(direction.mul(SPEED / dt));
    });
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

      // TODO: start duel
    });
  }
}