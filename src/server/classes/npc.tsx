import { assets } from "shared/constants";
import { getZoneModel } from "shared/utility/zone";
import type { NpcDescriptor } from "shared/structs/npc/descriptor";

import { NamedNPC } from "./named-npc";

export class NPC extends NamedNPC<NpcModel> {
  public constructor(
    public readonly descriptor: NpcDescriptor
  ) {
    // nametag is mounted client-side by QuestGiver, which has a live camera to scale against
    super(assets.npcs.WaitForChild(descriptor.name).Clone() as NpcModel);

    this.model.SetAttribute("ID", this.descriptor.id);
    this.model.PivotTo(this.descriptor.spawnCFrame);
    this.model.Parent = getZoneModel(this.descriptor.zone).NPCs;
  }
}