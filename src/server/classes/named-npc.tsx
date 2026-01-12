import Destroyable from "@rbxts/destroyable";
import Vide from "@rbxts/vide";

import { NametagContainer } from "shared/ui/components/nametag-container";

export class NamedNPC<ModelShape extends Model> extends Destroyable {
  public readonly root: BasePart;

  protected constructor(
    public readonly model: ModelShape,
    private readonly nametagUI: () => Vide.Node
  ) {
    super();
    this.trash.add(model);
    this.trash.linkToInstance(model);
    this.root = model.PrimaryPart!;
    this.createNametag();
  }

  private createNametag(): void {
    this.trash.add(Vide.mount(() => (
      <NametagContainer adornee={this.root}>
        {this.nametagUI()}
      </NametagContainer>
    ), this.root));
  }
}