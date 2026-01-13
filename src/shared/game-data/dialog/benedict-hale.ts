import { NpcID } from "shared/structs/npc/descriptor";
import { type DialogDescriptor, DialogID } from "shared/structs/npc/dialog";

export = {
  id: DialogID.enrollment_day_intro,
  speaker: NpcID.HeadmasterHale,
  paragraphs: [
    "Ah… you must be the new enrollee. I have reviewed many names in my time, but yours lingered longer than most, as if the parchment itself hesitated before accepting the ink. That is rarely coincidence within these walls.",
    "Welcome to the Academy. These halls were raised by hands long turned to dust, yet their intent remains—unyielding, watchful, and exacting. You walk now where scholars, prodigies, and fools once stood, each believing themselves prepared.",
    "From this day forward, your talent will be tested and refined through study, discipline, and hardship. Should you endure, you will emerge sharper than steel and far more dangerous; should you fail, the Academy will remember you only as another name crossed out.",
    "You will find instructors eager to impart their knowledge, though none will offer it freely or gently. Lessons here are paid for in effort, mistakes, and the quiet humility that follows both.",
    "Engrave this truth into your thoughts: power gained without restraint is not strength, but a liability waiting for the proper moment to betray its bearer. Many before you have learned this lesson too late.",
    "Now go. Orientation begins shortly, and the path set before you will not slow for hesitation. Destiny, like this Academy, favors those who step forward without asking permission."
  ]
} satisfies DialogDescriptor;