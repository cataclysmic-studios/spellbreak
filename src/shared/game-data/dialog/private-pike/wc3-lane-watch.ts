import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc3_LaneWatch,
  speaker: NpcID.CorporalVance,
  paragraphs: [
    "So the lane didn't take you. Small mercy. But don't mistake a quiet street for an empty one—Corporal Vance still walks patrol somewhere past the gate, and he'll have seen more than I have from out here.",

    "Find him first. He's stubborn and he won't say much to just anyone, but he trusts the Academy's word same as I do. Ask him what he's seen.",

    "There's also an old woman who never left when the lane was sealed—Miriam, the others call her. If anyone knows what's really nesting in those houses, it's her. She's frightened, so tread gently.",

    "Talk to them both. I want to know what we're dealing with before I report anything further up the chain."
  ]
} satisfies DialogDescriptor;
