import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";
import { QuestID } from "shared/structs/quests";

export = {
  id: DialogID.Wc2_NewSaviorIntro,
  speaker: NpcID.PrivatePike,
  givesQuest: QuestID.WC_2,
  paragraphs: [
    "I won't pretend I'm not afraid. The sounds coming from the lane at night—scraping stone, whispers where there shouldn't be any—no guard should face that alone, and the others won't step inside.",

    "If I open this gate, I'll be breaking orders. If I don't, I'll be leaving people trapped with whatever's taken hold in there. I didn't take this post to stand idle while a street dies behind iron bars.",

    "Go on. I'll say the lock jammed and the watch was empty when you passed through. Do what you must, end whatever's haunting Pegasus Lane, and give me a reason to believe this city is still worth guarding.",

    "I'll keep watch from here. If you don't return by dawn… I'll make sure your name is remembered for more than disobedience."
  ]
} satisfies DialogDescriptor;
