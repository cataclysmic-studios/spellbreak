import { Controller, type OnStart, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { QuestGiver } from "client/classes/quest-giver";
import type { NpcID } from "shared/structs/npc/descriptor";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { InputController } from "./input";
import type { CharacterController } from "./character";
import { canReceiveQuest, hasQuest } from "shared/utility/quests";

const NPC_MODELS = getChildrenOfType<"Model", NpcModel>(World.NPCs, "Model");

@Controller()
export class QuestController implements OnStart, OnTick {
  public readonly questGivers = new Map<NpcID, QuestGiver>;

  public constructor(
    private readonly ui: UIController,
    private readonly input: InputController,
    private readonly character: CharacterController
  ) { }

  public onStart(): void {
    this.input.actions.interact.activated.Connect(() => {
      for (const [_, questGiver] of this.questGivers)
        if (questGiver.canInteract())
          return this.npcInteract(questGiver)
    });
  }

  public onTick(dt: number): void {
    for (const [_, questGiver] of this.questGivers)
      questGiver.update(dt);
  }

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

  private npcInteract(questGiver: QuestGiver): void {
    Log.info("Interacting with NPC: " + questGiver.descriptor.name);
    const character = this.character.getData();
    for (const quest of questGiver.descriptor.questsGiven) {
      if (canReceiveQuest(character, quest))
        return this.ui.createDialog(quest.goals[0].dialog);
      else if (hasQuest(character, quest)) {
        const goalIndex = character.activeQuests[quest.id] ?? 0;
        return this.ui.createDialog(quest.goals[goalIndex].dialog);
      }
    }
  }
}