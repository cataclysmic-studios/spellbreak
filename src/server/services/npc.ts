import { Service, type OnStart } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { Message, messaging } from "shared/messaging";
import { getNpcByName } from "shared/utility/npc";
import { NPC } from "server/classes/npc";
import type { NpcID } from "shared/structs/npc/descriptor";
import Log from "shared/log";

import type { DatabaseService } from "./database";

@Service()
export class NpcService implements OnStart {
  private readonly toHydrate = new Set<NpcID>;

  public constructor(database: DatabaseService) {
    database.dataLoaded.Once(player => this.sendHydration(player));
  }

  public onStart(): void {
    const npcs = new Set<NPC>;
    const npcModels = getChildrenOfType<"Model", NpcModel>(World.NPCs, "Model");
    Log.info("Found " + npcModels.size() + " NPC models");

    for (const npcModel of npcModels) {
      const descriptor = getNpcByName(npcModel.Name);
      npcs.add(new NPC(npcModel, descriptor));
    }

    for (const npc of npcs)
      this.toHydrate.add(npc.descriptor.id);

    Log.info("Populated hydration set with " + this.toHydrate.size() + " NPCs");
  }

  public sendHydration(player: Player): void {
    Log.info("Sending hydrate message to " + player.Name);
    messaging.client.emit(player, Message.Hydrate_NPCs, this.toHydrate);
  }
}