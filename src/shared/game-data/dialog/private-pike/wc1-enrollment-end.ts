import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc1_EnrollmentEnd,
  speaker: NpcID.PrivatePike,
  paragraphs: [
    "Halt! Pegasus Lane is sealed by Crown order. No civilians, no spellcasters, and certainly no one wandering in on a quiet watch like this. If you've business here, it'll have to wait for daylight.",

    "…That sigil. Headmaster Hale doesn't send messengers lightly, and he doesn't lend his authority to fools. If he's involved, then whatever's happening beyond that gate is worse than what the reports say."
  ]
} satisfies DialogDescriptor;
