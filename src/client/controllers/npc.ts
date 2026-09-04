import { Controller, type OnStart, type OnTick } from "@flamework/core";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { QuestGiver } from "client/classes/quest-giver";
import { getNpcModelByID } from "shared/utility/npc";
import type { NpcID } from "shared/structs/npc/descriptor";
import Log from "shared/log";

import type { UIController } from "./ui";
import type { InputController } from "./input";
import type { CharacterController } from "./character";

@Controller()
export class NpcController implements OnStart, OnTick {
  public readonly questGivers = new Map<NpcID, QuestGiver>;

  public constructor(
    private readonly ui: UIController,
    private readonly input: InputController,
    private readonly character: CharacterController
  ) { }

  public onStart(): void {
    this.input.actions.interact.activated.Connect(() => this.onInteract());
  }

  public onTick(dt: number): void {
    let interacting = false;
    for (const [_, questGiver] of this.questGivers) {
      questGiver.update(dt);

      if (!questGiver.canInteract()) continue;
      this.ui.enableInteractPrompt(questGiver.descriptor.id);
      interacting = true;
    }

    if (interacting) return;
    this.ui.disableInteractPrompt();
  }

  @OnClientMessage(Message.Hydrate_NPCs)
  public onNpcHydrate(toHydrate: MessageData[Message.Hydrate_NPCs]): void {
    Log.info("Hydrating NPCs...");
    for (const id of toHydrate) {
      if (this.questGivers.has(id)) continue;

      const model = getNpcModelByID(id);
      const questGiver = new QuestGiver(this.character, model);
      this.questGivers.set(id, questGiver);
    }
  }

  /** @hidden */
  @OnClientMessage(Message.Dehydrate_NPCs)
  public onNpcDehydrate(toDehydrate: MessageData[Message.Dehydrate_NPCs]): void {
    Log.info("Dehydrating NPCs...");
    for (const id of toDehydrate) {
      const questGiver = this.questGivers.get(id);
      if (questGiver === undefined) continue;

      questGiver.destroy();
      this.questGivers.delete(id);
    }
  }

  private onInteract(): void {
    const questGiver = this.getInteractableQuestGiver();
    if (!questGiver) return;

    Log.info("Interacting with NPC: " + questGiver.descriptor.name);
    const character = this.character.getData();
    const dialog = questGiver.interact(character);
    if (dialog === undefined) return;

    this.ui.createDialog(dialog);
  }

  private getInteractableQuestGiver(): Maybe<QuestGiver> {
    for (const [_, questGiver] of this.questGivers)
      if (questGiver.canInteract())
        return questGiver;

    return;
  }
}