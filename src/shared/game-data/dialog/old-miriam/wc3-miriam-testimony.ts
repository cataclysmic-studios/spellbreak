import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc3_MiriamTestimony,
  speaker: NpcID.OldMiriam,
  paragraphs: [
    "Oh—a wizard, and a young one. Don't linger on my step, dear, not with them about. I've lived on this lane sixty years and I've never once locked my door until now.",

    "They came up from the old crypt beneath the tower, I'd wager. Dark Wizards, the corporal calls them. I call them a warning nobody listened to until it was already inside the walls.",

    "They keep to the shadows between the lamps. If you've got the nerve to face them, I won't stop you—but be careful, child. Whatever they were before, there's little of it left."
  ]
} satisfies DialogDescriptor;
