import { NamedNPC } from "./named-npc";
import type { NpcDescriptor } from "shared/structs/npc/descriptor";

export class NPC extends NamedNPC<NpcModel> {
  public constructor(
    public readonly model: NpcModel,
    public readonly descriptor: NpcDescriptor
  ) {
    // nametag is mounted client-side by QuestGiver, which has a live camera to scale against
    super(model);

    this.model.SetAttribute("ID", this.descriptor.id);
  }
}