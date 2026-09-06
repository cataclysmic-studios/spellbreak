import Vide, { source } from "@rbxts/vide";

import { getNpcByID } from "shared/utility/npc";
import { canReceiveQuest, getActiveQuestIDs, getFirstCompletableTalkGoal, getQuestByID, getQuestsGivenBy, hasQuest, canGiveNewQuest, hasActiveQuestFrom } from "shared/utility/quests";
import { character } from "client/constants";
import { nametagColors } from "shared/constants";
import { NpcID, type NpcDescriptor } from "shared/structs/npc/descriptor";
import type { DialogID } from "shared/structs/npc/dialog";
import type { CharacterData } from "shared/structs/data";
import Log from "shared/log";

import { AlertMode, QuestAlert } from "shared/ui/components/quest/alert";
import { QuestAlertContainer } from "shared/ui/components/quest/alert-container";
import { NametagContainer } from "shared/ui/components/nametag-container";
import { Nametag } from "shared/ui/components/nametag";

import type { CharacterController } from "client/controllers/character";

const INTERACTION_DISTANCE = 7.5;

export class QuestGiver<ModelShape extends Model = NpcModel> {
  public readonly descriptor: NpcDescriptor;
  private readonly root: BasePart;
  private readonly alertMode = source(AlertMode.Disabled);
  private readonly cleanup: (() => void)[] = [];
  private inRange = false;

  public constructor(
    private readonly character: CharacterController,
    public readonly npcModel: ModelShape
  ) {
    const id = npcModel.GetAttribute<NpcID>("ID");
    Log.assert(id !== undefined, "quest giver npc id not found");

    this.descriptor = getNpcByID(id);
    this.root = npcModel.PrimaryPart!;

    const connection = this.character.updated.Connect(() => this.updateMode());
    this.cleanup.push(() => connection.Disconnect());
    if (this.character.isLoaded())
      this.updateMode();
    this.mountNametag();
    this.mountQuestAlert();
    Log.info("Created new quest giver for NPC: " + this.descriptor.name);
  }

  /** Unmounts this quest giver's UI - call when its NPC despawns (e.g. its zone emptied out). */
  public destroy(): void {
    for (const dispose of this.cleanup)
      dispose();
  }

  public interact(character: CharacterData): Maybe<DialogID> {
    const { descriptor } = this;
    const questsGiven = getQuestsGivenBy(descriptor.id);
    const ids = [...getActiveQuestIDs(character), ...questsGiven];
    const result = getFirstCompletableTalkGoal(character, descriptor.id, ids);
    if (result !== undefined)
      return result.goal.completionDialog;

    for (const id of questsGiven) {
      const givenQuest = getQuestByID(id);
      if (canReceiveQuest(character, givenQuest) || hasQuest(character, givenQuest))
        return givenQuest.offerDialog;
    }

    return;
  }

  public canInteract(): boolean {
    return this.inRange && this.alertMode() !== AlertMode.Disabled;
  }

  public update(dt: number): void {
    const characterPosition = character.collider.Position;
    const position = this.root.Position;
    const distance = position.sub(characterPosition).Magnitude;
    this.inRange = distance <= INTERACTION_DISTANCE;
  }

  private mountNametag(): void {
    const { name, title } = this.descriptor;
    this.cleanup.push(Vide.mount(() => (
      <NametagContainer adornee={this.root}>
        <Nametag name={name} description={title} color={nametagColors.npc} />
      </NametagContainer>
    ), this.root));
  }

  private mountQuestAlert(): void {
    this.cleanup.push(Vide.mount(() => (
      <QuestAlertContainer adornee={this.root} >
        <QuestAlert mode={this.alertMode} />
      </QuestAlertContainer>
    ), this.root));
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