import type { BaseID } from "@rbxts/id";

import type { NpcID } from "./descriptor";

/**
 * Named `<Quest>_<Moment>` so it's obvious which quest a line belongs to
 * without having to cross-reference the quest files, e.g. `Wc1_EnrollmentEnd`
 * is spoken during `QuestID.WC_1`, at the "enrollment end" beat.
 */
export const enum DialogID {
  Wc1_EnrollmentIntro,
  Wc1_EnrollmentEnd,
  Wc2_NewSaviorIntro,
  Wc2_VanceReport,
  Wc3_LaneWatch,
  Wc3_MiriamTestimony,
  Wc4_MiriamsRequest,
  Wc4_MiriamsPlea,
}

/**
 * One NPC's full turn of dialog - a sequence of `paragraphs` shown one at a
 * time (see `shared/ui/components/hud/dialog.tsx`). Dialogs are never linked
 * to each other directly - whether a dialog starts or completes a quest is
 * decided entirely by `QuestDescriptor`: a dialog starts a quest by being
 * that quest's `offerDialog`, and completes a `TalkQuestGoal` by being that
 * goal's `completionDialog`. `shared/utility/quests.ts` derives every
 * NPC/dialog/quest lookup from those two fields alone - don't duplicate them
 * back onto `NpcDescriptor`/`DialogDescriptor`, or the two can drift apart.
 */
export interface DialogDescriptor extends BaseID<DialogID> {
  readonly speaker: NpcID;
  readonly paragraphs: string[];
}
