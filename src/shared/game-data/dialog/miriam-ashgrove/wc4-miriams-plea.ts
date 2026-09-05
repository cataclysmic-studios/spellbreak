import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc4_MiriamsPlea,
  speaker: NpcID.MiriamAshgrove,
  paragraphs: [
    "You've come back, and still breathing—that's more than I expected. I've been thinking on what I told you, and I can't sit behind this door any longer while they wander closer every night.",

    "Someone has to drive them out, or at least thin their numbers enough that Vance's watch can hold the line. I wouldn't ask a stranger this, but you're no stranger to that staff you carry.",

    "Find the Dark Wizards skulking this lane and put them to rest properly this time. Do that, and maybe an old woman can finally leave her lamp unlit at night."
  ]
} satisfies DialogDescriptor;
