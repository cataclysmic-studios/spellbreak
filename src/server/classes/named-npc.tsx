import Destroyable from "@rbxts/destroyable";
import Vide from "@rbxts/vide";

import { NametagContainer } from "shared/ui/components/nametag-container";

export class NamedNPC<ModelShape extends Model> extends Destroyable {
  public readonly model: ModelShape;
  public readonly root: BasePart;

  protected constructor(
    modelTemplate: ModelShape,
    private readonly nametagUI: () => Vide.Node
  ) {
    super();
    this.model = this.trash.add(modelTemplate.Clone());
    this.root = this.model.PrimaryPart!;
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