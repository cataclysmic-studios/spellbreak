import { NpcID } from "shared/structs/npc/descriptor";
import { QuestID } from "shared/structs/quests";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.Wc1_EnrollmentIntro,
  speaker: NpcID.HeadmasterHale,
  givesQuest: QuestID.WC_1,
  paragraphs: [
    "Wizard, the situation in Pegasus Lane has grown beyond rumor and into consequence. Whatever force has taken root there is spreading fear faster than the city guard can contain it.",

    "The lane has been sealed by order of the Crown, and no citizen is permitted passage—least of all one carrying spellcraft so openly. The guard fears escalation more than inaction, and so the gates remain closed.",

    "You are to seek out Private Pike at the eastern checkpoint. He is young, earnest, and painfully aware that the lane he stands watch over is rotting behind locked bars.",

    "Show him my sigil and speak plainly. He has been instructed to trust my judgment when the matter concerns the safety of the city, even if it costs him a night of uneasy sleep.",

    "Once inside Pegasus Lane, you are to discover the source of the disturbance and put an end to it—quietly, if possible. The Academy does not need a spectacle, only results.",

    "Go now. If Pegasus Lane is to be saved, it will not be by hesitation or decree, but by decisive action from those willing to step where others will not."
  ]
} satisfies DialogDescriptor;
