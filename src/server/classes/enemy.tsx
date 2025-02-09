import { Players, Workspace as World } from "@rbxts/services";
import type { BaseID } from "@rbxts/id";
import Vide from "@rbxts/vide";

import { assets } from "shared/constants";
import { Destroyable } from "shared/classes/destroyable";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { NametagContainer } from "shared/ui/components/nametag-container";
import { EnemyNametag } from "shared/ui/components/enemy-nametag";
import { Dependency } from "@flamework/core";
import { DuelService } from "server/services/duel";

export class Enemy extends Destroyable implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly duel = Dependency<DuelService>();
  public readonly id = Enemy.cumulativeID++;
  public readonly model: EnemyModel;

  public constructor(
    public readonly descriptor: EnemyDescriptor
  ) {
    super();
    this.model = this.janitor.Add(assets.enemies.WaitForChild<EnemyModel>(descriptor.name).Clone());
    this.createNametag();
    this.registerTouch();
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

      if (this.duel.comabatantsInDuels.has(playerWhoTouched) || this.duel.comabatantsInDuels.has(this)) return;
      this.duel.startPvE(playerWhoTouched, this);
    });
  }

  private createNametag(): void {
    const root = this.model.PrimaryPart!;
    this.janitor.Add(Vide.mount(() => (
      <NametagContainer adornee={root}>
        <EnemyNametag descriptor={this.descriptor} containerSize={new Vector2(240, 40)} />
      </NametagContainer>
    ), root));
  }
}