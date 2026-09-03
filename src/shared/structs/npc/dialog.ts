import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./descriptor";
import { QuestID } from "../quests";

/**
 * Named `<Quest>_<Moment>` so it's obvious which quest a line belongs to
 * without having to cross-reference the quest files, e.g. `Wc1_EnrollmentEnd`
 * is spoken during `QuestID.WC_1`, at the "enrollment end" beat.
 */
export const enum DialogID {
  Wc1_EnrollmentIntro,
  Wc1_EnrollmentEnd,
  Wc2_NewSaviorIntro,
}

/**
 * One NPC's full turn of dialog - a sequence of `paragraphs` shown one at a
 * time (see `shared/ui/components/dialog.tsx`), optionally ending in a quest
 * offer. Dialogs are never linked to each other directly; which one plays is
 * decided by quest state (`QuestDescriptor.dialog`, `TalkQuestGoal.completionDialog`)
 * in `shared/utility/quests.ts`.
 */
export interface DialogDescriptor extends BaseID<DialogID> {
  readonly speaker: NpcID;
  readonly paragraphs: string[];
  readonly givesQuest?: QuestID;
}
