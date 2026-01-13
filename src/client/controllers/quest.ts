import { Controller, type OnStart, type OnTick } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { getChildrenOfType } from "@rbxts/instance-utility";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { canReceiveQuest, getActiveQuestIDs, getFirstCompletableTalkGoal, getQuestByID, hasCompletedQuest, hasQuest } from "shared/utility/quests";
import { QuestGiver } from "client/classes/quest-giver";
import type { NpcID } from "shared/structs/npc/descriptor";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { InputController } from "./input";
import type { CharacterController } from "./character";
import Object from "@rbxts/object-utils";
import { QuestID } from "shared/structs/quests";
import { CharacterData } from "shared/structs/data";

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
          return this.npcInteract(questGiver);
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
    const { descriptor } = questGiver;
    Log.info("Interacting with NPC: " + descriptor.name);

    const character = this.character.getData();
    const ids = [...getActiveQuestIDs(character), ...descriptor.questsGiven];
    const result = getFirstCompletableTalkGoal(character, descriptor.id, ids);
    if (result !== undefined) {
      const { goal } = result;
      return this.ui.createDialog(goal.dialog);
    }

    for (const id of descriptor.questsGiven) {
      const givenQuest = getQuestByID(id);
      if (canReceiveQuest(character, givenQuest) || hasQuest(character, givenQuest))
        return this.ui.createDialog(givenQuest.dialog);
    }
  }
}