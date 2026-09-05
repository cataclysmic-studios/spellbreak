import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc4_MiriamsRequest,
  speaker: NpcID.OldMiriam,
  paragraphs: [
    "You're still here. Good—that means you were listening. I've been sitting with what I told you, and I can't keep hiding behind this door while they wander closer every night.",

    "Someone has to drive them out, or at least thin their numbers enough that Vance's watch can hold the line. I wouldn't ask a stranger this, but you're no stranger to that staff you carry.",

    "Find the Dark Wizards skulking this lane and put them to rest. Do that, and maybe an old woman can finally leave her lamp unlit at night."
  ]
} satisfies DialogDescriptor;
