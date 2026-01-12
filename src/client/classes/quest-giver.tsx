import { atom } from "@rbxts/charm";
import Vide from "@rbxts/vide";

import { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

import { getNpcByID } from "shared/utility/npc";
import { hasCompletedQuest, hasQuest } from "shared/utility/quests";
import { AlertMode, QuestAlert } from "shared/ui/components/quest-alert";
import { QuestAlertContainer } from "shared/ui/components/quest-alert-container";

import type { CharacterController } from "client/controllers/character";
import Log from "shared/log";

export class QuestGiver<ModelShape extends Model> {
  public readonly alertMode = atom(AlertMode.Disabled);
  public readonly root: BasePart;
  public readonly descriptor: NpcDescriptor;

  public constructor(
    private readonly character: CharacterController,
    public readonly npcModel: ModelShape
  ) {
    const id = npcModel.GetAttribute<NpcID>("ID");
    assert(id !== undefined, "quest giver npc id not found");

    this.descriptor = getNpcByID(id);
    this.root = npcModel.PrimaryPart!;
    this.character.updated.Connect(() => this.updateMode());
    this.updateMode();
    this.mountQuestAlert();
    Log.info("Created new quest giver for NPC: " + this.descriptor.name);
  }

  private mountQuestAlert(): void {
    Vide.mount(() => (
      <QuestAlertContainer adornee={this.root} >
        <QuestAlert mode={this.alertMode} />
      </QuestAlertContainer>
    ), this.root);
  }

  private updateMode(): void {
    const character = this.character.getData();
    const givesMoreQuests = this.descriptor.questsGiven.some(quest => !hasQuest(character, quest) && !hasCompletedQuest(character, quest));
    if (givesMoreQuests)
      return void this.alertMode(AlertMode.PickUp);

    const canHandInQuest = this.descriptor.questsGiven.some(quest => hasQuest(character, quest) && false); // TODO: check goals
    if (canHandInQuest)
      return void this.alertMode(AlertMode.HandIn);

    const inProgress = this.descriptor.questsGiven.some(quest => hasQuest(character, quest));
    if (inProgress)
      return void this.alertMode(AlertMode.InProgress);

    return void this.alertMode(AlertMode.Disabled);
  }
}