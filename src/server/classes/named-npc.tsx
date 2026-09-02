import Destroyable from "@rbxts/destroyable";
import Vide from "@rbxts/vide";

import { NametagContainer } from "shared/ui/components/nametag-container";

export class NamedNPC<ModelShape extends Model> extends Destroyable {
  public readonly root: BasePart;

  /**
   * @param nametagUI Builds this NPC's nametag UI. Only pass this for NPCs with no client-side
   * counterpart to mount a nametag from instead (e.g. `Enemy`) — nametags depend on client-only
   * hooks like camera/viewport scaling, so anything with a client representation (e.g. `QuestGiver`)
   * should mount its own nametag there instead of going through this server-side path.
   */
  protected constructor(
    public readonly model: ModelShape,
    private readonly nametagUI?: () => Vide.Node
  ) {
    super();
    this.trash.add(model);
    this.trash.linkToInstance(model);
    this.root = model.PrimaryPart!;
    if (this.nametagUI)
      this.createNametag();
  }

  private createNametag(): void {
    this.trash.add(Vide.mount(() => (
      <NametagContainer adornee={this.root}>
        {this.nametagUI!()}
      </NametagContainer>
    ), this.root));
  }
}