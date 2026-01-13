import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./descriptor";

export const enum DialogID {
  enrollment_day_intro
}

export interface DialogDescriptor extends BaseID<DialogID> {
  readonly speaker: NpcID;
  readonly paragraphs: string[];
}