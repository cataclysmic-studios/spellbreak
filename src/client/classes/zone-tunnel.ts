import { hasCompletedQuest, getQuestIDByName } from "shared/utility/quests";
import type { QuestID } from "shared/structs/quests";

import type { CharacterController } from "client/controllers/character";

const OPEN_OFFSET = new Vector3(0, 9, 0);

export class ZoneTunnel {
  private readonly gate: BasePart;
  private readonly closedCFrame: CFrame;
  private readonly requiredQuestID?: QuestID;

  /** `RequiredQuestID` is set in Studio as the *name* of the `QuestID` enum member (e.g. "WC_1"), not its numeric value. */
  public constructor(
    private readonly character: CharacterController,
    public readonly model: TunnelModel
  ) {
    // Zones are spread far apart with StreamingEnabled on, so `gate` may not have streamed in yet even though `model` has.
    this.gate = model.WaitForChild("gate") as BasePart;
    this.closedCFrame = this.gate.CFrame;

    const questName = model.GetAttribute<string>("RequiredQuestID");
    this.requiredQuestID = questName !== undefined ? getQuestIDByName(questName) : undefined;

    this.character.updated.Connect(() => this.updateGate());
    this.updateGate();
  }

  private updateGate(): void {
    if (!this.character.isLoaded()) return;

    const open = this.requiredQuestID === undefined || hasCompletedQuest(this.character.getData(), this.requiredQuestID);
    this.gate.CFrame = open ? this.closedCFrame.add(OPEN_OFFSET) : this.closedCFrame;
    this.gate.CanCollide = !open;
  }
}
