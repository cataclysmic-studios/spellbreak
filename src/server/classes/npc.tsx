import Vide from "@rbxts/vide";

import { nametagColors } from "shared/constants";

import { NamedNPC } from "./named-npc";
import { Nametag } from "shared/ui/components/nametag";
import type { NpcDescriptor } from "shared/structs/npc/descriptor";


export class NPC extends NamedNPC<NpcModel> {
  public constructor(
    public readonly model: NpcModel,
    public readonly descriptor: NpcDescriptor
  ) {
    super(
      model,
      () => <Nametag name={descriptor.name} description={descriptor.title} color={nametagColors.npc} />
    );

    this.model.SetAttribute("ID", this.descriptor.id);
  }
}