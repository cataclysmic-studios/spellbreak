import { Workspace as World } from "@rbxts/services";

import { assets } from "shared/constants";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

export class Enemy {
  public readonly model: Model;

  public constructor(
    public readonly descriptor: EnemyDescriptor
  ) {
    this.model = assets.enemies.WaitForChild<Model>(descriptor.name).Clone();
  }

  public teleport(part: BasePart): void {
    const [_, size] = this.model.GetBoundingBox();
    this.model.PivotTo(part.CFrame.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0)));
    this.model.Parent = World;
  }
}