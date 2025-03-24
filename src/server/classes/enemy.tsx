import { Players, RunService, Workspace as World } from "@rbxts/services";
import type { BaseID } from "@rbxts/id";
import Vide from "@rbxts/vide";

import { assets } from "shared/constants";
import { Destroyable } from "shared/classes/destroyable";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { NametagContainer } from "shared/ui/components/nametag-container";
import { EnemyNametag } from "shared/ui/components/enemy-nametag";
import { Dependency } from "@flamework/core";
import { DuelService } from "server/services/duel";

const SPEED = 5; // studs per second

export class Enemy extends Destroyable implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly duel = Dependency<DuelService>();
  public readonly id = Enemy.cumulativeID++;
  public readonly model: EnemyModel;
  public readonly root: BasePart;
  private moveConnection?: RBXScriptConnection;

  public constructor(
    public readonly descriptor: EnemyDescriptor
  ) {
    super();
    this.model = this.janitor.Add(assets.enemies.WaitForChild<EnemyModel>(descriptor.name).Clone());
    this.root = this.model.PrimaryPart!;

    this.model.AddTag("Enemy");
    this.model.SetAttribute("ID", this.id);
    this.createNametag();
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

      this.root.CFrame = this.root.CFrame.add(direction.mul(SPEED * dt));
    });
  }

  public teleport(part: BasePart): void {
    const [_, size] = this.model.GetBoundingBox();
    this.model.PivotTo(part.CFrame.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0)));
    this.model.Parent = World;
  }

  public isInDuel(): boolean {
    return this.duel.comabatantsInDuels.has(this);
  }

  private registerTouch(): void {
    const conn = this.model.collider.Touched.Connect(hit => {
      const playerWhoTouched = Players.GetPlayerFromCharacter(hit.FindFirstAncestorOfClass("Model"));
      if (playerWhoTouched === undefined) return;
      conn.Disconnect();

      if (this.duel.comabatantsInDuels.has(playerWhoTouched) || this.duel.comabatantsInDuels.has(this)) return;
      this.duel.startPvE(playerWhoTouched, this);
    });
  }

  private createNametag(): void {
    this.janitor.Add(Vide.mount(() => (
      <NametagContainer adornee={this.root}>
        <EnemyNametag descriptor={this.descriptor} containerSize={new Vector2(240, 40)} />
      </NametagContainer>
    ), this.root));
  }
}