import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { QuestGiver } from "client/classes/quest-giver";
import type { NpcID } from "shared/structs/npc/descriptor";
import Log from "shared/log";

import type { CharacterController } from "./character";

const NPC_MODELS = getChildrenOfType<"Model", NpcModel>(World.NPCs, "Model");

@Controller()
export class QuestController {
  public readonly questGivers = new Map<NpcID, QuestGiver<NpcModel>>;

  public constructor(
    private readonly character: CharacterController
  ) { }

  @OnClientMessage(Message.Hydrate_NPCs)
  public onNpcHydrate(toHydrate: MessageData[Message.Hydrate_NPCs]): void {
    Log.info("Hydrating NPCs...");
    for (const id of toHydrate) {
      const model = NPC_MODELS.find(child => child.GetAttribute<NpcID>("ID") === id);
      if (model === undefined) {
        Log.warn(`Failed to hydrate NPC with ID ${id}, no model found`);
        continue;
      }

      const questGiver = new QuestGiver(this.character, model);
      this.questGivers.set(id, questGiver);
    }
  }
}