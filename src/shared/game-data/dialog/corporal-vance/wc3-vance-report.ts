import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc2_VanceReport,
  speaker: NpcID.CorporalVance,
  paragraphs: [
    "Pike sent you? Figures—he's too soft to walk this street himself. Keep your voice down. Something's been moving between the houses after dark, and it isn't the wind.",

    "I've counted at least a handful of them. Wizards, or what's left of wizards—robes rotted through, eyes like burnt-out lanterns. Death school, if I had to guess. They don't attack in the open, not yet.",

    "There's an old woman a few doors down who's seen more than I have. Miriam. She won't talk to soldiers, but she might talk to you. Go on—I'll keep watch here."
  ]
} satisfies DialogDescriptor;
