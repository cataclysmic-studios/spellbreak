import Vide, { source } from "@rbxts/vide";

import { NpcDescriptor, NpcID } from "shared/structs/npc/descriptor";

import { getNpcByID } from "shared/utility/npc";
import { hasCompletedQuest, hasQuest } from "shared/utility/quests";
import { character } from "client/constants";
import { AlertMode, QuestAlert } from "shared/ui/components/quest-alert";
import { QuestAlertContainer } from "shared/ui/components/quest-alert-container";
import Log from "shared/log";

import type { CharacterController } from "client/controllers/character";

const INTERACTION_DISTANCE = 7.5;

export class QuestGiver<ModelShape extends Model = NpcModel> {
  public readonly descriptor: NpcDescriptor;
  private readonly root: BasePart;
  private readonly alertMode = source(AlertMode.Disabled);
  private inRange = false;

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

  public canInteract(): boolean {
    return this.inRange;
  }

  public update(dt: number): void {
    const characterPosition = character.collider.Position;
    const position = this.root.Position;
    const distance = position.sub(characterPosition).Magnitude;
    this.inRange = distance <= INTERACTION_DISTANCE;
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
    const { questsGiven } = this.descriptor;
    const givesMoreQuests = questsGiven.some(quest => !hasQuest(character, quest) && !hasCompletedQuest(character, quest));
    if (givesMoreQuests)
      return void this.alertMode(AlertMode.PickUp);

    const canHandInQuest = questsGiven.some(quest => hasQuest(character, quest) && false); // TODO: check goals
    if (canHandInQuest)
      return void this.alertMode(AlertMode.HandIn);

    const inProgress = questsGiven.some(quest => hasQuest(character, quest));
    if (inProgress)
      return void this.alertMode(AlertMode.InProgress);

    return void this.alertMode(AlertMode.Disabled);
  }
}