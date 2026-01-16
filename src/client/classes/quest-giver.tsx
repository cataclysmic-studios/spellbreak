import Vide, { source } from "@rbxts/vide";

import { canGiveNewQuest, getNpcByID, hasActiveQuestFrom } from "shared/utility/npc";
import { canReceiveQuest, getActiveQuestIDs, getFirstCompletableTalkGoal, getQuestByID, hasQuest} from "shared/utility/quests";
import { character } from "client/constants";
import { NpcID, type NpcDescriptor } from "shared/structs/npc/descriptor";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";
import Log from "shared/log";

import { AlertMode, QuestAlert } from "shared/ui/components/quest-alert";
import { QuestAlertContainer } from "shared/ui/components/quest-alert-container";

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

  public interact(character: CharacterData): Maybe<DialogID> {
    const {descriptor} = this;
    const ids = [...getActiveQuestIDs(character), ...descriptor.questsGiven];
    const result = getFirstCompletableTalkGoal(character, descriptor.id, ids);
    if (result !== undefined)
      return result.goal.completionDialog;

    for (const id of descriptor.questsGiven) {
      const givenQuest = getQuestByID(id);
      if (canReceiveQuest(character, givenQuest) || hasQuest(character, givenQuest))
        return givenQuest.dialog;
    }

    return;
  }

  public canInteract(): boolean {
    return this.inRange;
  }

  public update(dt: number): void {
    // TODO: show interact prompt
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
    if (canGiveNewQuest(character, this.descriptor))
      return void this.alertMode(AlertMode.PickUp);

    const result = getFirstCompletableTalkGoal(character, this.descriptor.id);
    if (result !== undefined)
      return void this.alertMode(AlertMode.HandIn);

    if (hasActiveQuestFrom(character, this.descriptor))
      return void this.alertMode(AlertMode.InProgress);

    this.alertMode(AlertMode.Disabled);
  }
}