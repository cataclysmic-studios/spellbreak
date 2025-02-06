import { Workspace as World } from "@rbxts/services";
import Vide, { source } from "@rbxts/vide";

import { assets } from "shared/constants";
import { Destroyable } from "shared/classes/destroyable";
import type { EnemyDescriptor } from "shared/structs/enemy/descriptor";

import { NametagContainer } from "shared/ui/components/nametag-container";
import { EnemyNametag } from "shared/ui/components/enemy-nametag";

export class Enemy extends Destroyable {
  public readonly model: Model;

  public constructor(
    public readonly descriptor: EnemyDescriptor
  ) {
    super();
    this.model = this.janitor.Add(assets.enemies.WaitForChild<Model>(descriptor.name).Clone());
    this.createNametag();
  }

  public teleport(part: BasePart): void {
    const [_, size] = this.model.GetBoundingBox();
    this.model.PivotTo(part.CFrame.add(new Vector3(0, size.Y / 2 - part.Size.Y / 2, 0)));
    this.model.Parent = World;
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