import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./descriptor";
import { QuestID } from "../quests";

export const enum DialogID {
  enrollment_day_intro,
  enrollment_day_end
}

export interface DialogDescriptor extends BaseID<DialogID> {
  readonly speaker: NpcID;
  readonly paragraphs: string[];
  readonly givesQuest?: QuestID;
}