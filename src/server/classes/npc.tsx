import type { BaseID } from "@rbxts/id";
import Vide from "@rbxts/vide";

import { assets, nametagColors } from "shared/constants";

import { NamedNPC } from "./named-npc";
import { Message, messaging } from "shared/messaging";
import { Nametag } from "shared/ui/components/nametag";
import type { NpcDescriptor } from "shared/structs/npc/descriptor";


export class NPC extends NamedNPC<EnemyModel> implements BaseID<number> {
  public static cumulativeID = 0;

  public readonly id = NPC.cumulativeID++;

  public constructor(
    public readonly descriptor: NpcDescriptor
  ) {
    super(
      assets.enemies.WaitForChild(descriptor.name),
      () => <Nametag name={descriptor.name} description={descriptor.title} color={nametagColors.npc} />
    );

    this.model.SetAttribute("ID", this.id);
  }
}