import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.enrollment_day_end,
  speaker: NpcID.PrivatePike,
  paragraphs: [
    "Halt! Pegasus Lane is sealed by Crown order. No civilians, no spellcasters, and certainly no one wandering in on a quiet watch like this. If you've business here, it'll have to wait for daylight.",

    "…That sigil. Headmaster Hale doesn't send messengers lightly, and he doesn't lend his authority to fools. If he's involved, then whatever's happening beyond that gate is worse than what the reports say.",

    "I won't pretend I'm not afraid. The sounds coming from the lane at night—scraping stone, whispers where there shouldn't be any—no guard should face that alone, and the others won't step inside.",

    "If I open this gate, I'll be breaking orders. If I don't, I'll be leaving people trapped with whatever's taken hold in there. I didn't take this post to stand idle while a street dies behind iron bars.",

    "Go on. I'll say the lock jammed and the watch was empty when you passed through. Do what you must, end whatever's haunting Pegasus Lane, and give me a reason to believe this city is still worth guarding.",

    "I'll keep watch from here. If you don't return by dawn… I'll make sure your name is remembered for more than disobedience."
  ]
} satisfies DialogDescriptor;