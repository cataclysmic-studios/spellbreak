/**
 * A real runtime object rather than a `const enum` - inlining these as string literals would
 * leave nothing for `AssetPreloadController` to enumerate at runtime.
 */
export const Images = {
  // pieces of ui
  Vignette: "rbxassetid://94231339640816",
  ParchmentBanner: "rbxassetid://6099008610",
  TinyParchmentBanner: "rbxassetid://139883692158687",
  BookBinding: "rbxassetid://92180308011222",
  RedRibbon: "rbxassetid://83791914432890",
  RedSpiral: "http://www.roblox.com/asset/?id=951593731",
  CharacterPortraitBorder: "rbxassetid://70593165679463",
  XpBar: "rbxassetid://98343191921887",

  // backgrounds
  Background_WaitingForOthers: "rbxassetid://98612224033956",
  Background_CardInfo: "rbxassetid://13711786825",
  Background_Dialog: "rbxassetid://125227688237254",
  Background_XP: "rbxassetid://78695210211208",
  Background_MainQuestFrame: "rbxassetid://72251088033236",
  Background_QuestFrame: "rbxassetid://123137161798867",
  Background_QuestSketch1: "rbxassetid://130530493513222",
  Background_QuestSketch2: "rbxassetid://118698903024559",
  Background_QuestSketch3: "rbxassetid://136091759861800",
  Background_QuestSketch4: "rbxassetid://81287145746042",
  Background_BookPages: "rbxassetid://127231701835352",
  Background_Character_Left: "rbxassetid://87814172811818",
  Background_Character_Right_Stats: "rbxassetid://105784281485986",
  Background_Character_Right_Stats_Advanced: "rbxassetid://112617036074292",
  Background_Character_Right_Stats_Advanced02: "rbxassetid://130009254951468",
  Background_Character_Right_Badges: "rbxassetid://105466035109231",
  Background_Character_Right_Badges_Category: "rbxassetid://121446098820949",
  Background_Character_Right_PvP: "rbxassetid://94908892578669",
  Background_Character_Right_Craft: "rbxassetid://85627694081294",
  Background_Character_Right_Craft01: "rbxassetid://126727908094999",
  Background_Character_Right_Craft02: "rbxassetid://101607470951365",
  Background_Character_Right_Craft03: "rbxassetid://119769672264730",
  Background_Character_Right_Magic_Weaving: "rbxassetid://116273833827345",
  Background_Character_Right_Timer: "rbxassetid://137378809068324",
  Background_Stars: "rbxassetid://124572211915891",

  // icons
  Icon_Gold: "rbxassetid://120546981073024",
  Icon_XP: "rbxassetid://99806776497589",

  // inputs
  Input_X: "rbxassetid://85088521586876",
  Input_LeftClick: "rbxassetid://100792763769033",

  // npc portraits
  Portrait_HeadmasterHale: "rbxassetid://131377265144889",
  Portrait_PrivatePike: "rbxassetid://108261292143077",
  Portrait_CorporalVance: "rbxassetid://0",
  Portrait_MiriamAshgrove: "rbxassetid://0",

  // enemy portraits
  Portrait_DarkWizard: "rbxassetid://137979679635761",
  Portrait_Shatterbones: "rbxassetid://0",

  // zone portraits
  Portrait_TownSquare: "rbxassetid://0",
  Portrait_HeadmastersOffice: "rbxassetid://0",
  Portrait_PegasusLane: "rbxassetid://0",
  Portrait_ShatterbonesTower: "rbxassetid://0",

  // spritesheets
  LargeIconSpritesheet: "rbxassetid://16821859312",
  LargeIconSpritesheet2: "rbxassetid://114537181138499",

  // buttons
  Button_Left: "rbxassetid://139103554585837",
  Button_Right: "rbxassetid://104725083513597",
  Button_Spellbook: "rbxassetid://101729984023869",
  Button_Book_CharacterStats: "rbxassetid://127548287857297",
  Button_Book_Backpack: "rbxassetid://114372155093803",
  Button_Book_Pets: "rbxassetid://78685612287498",
  Button_Book_Quests: "rbxassetid://119445470356641",
  Button_Book_Deck: "rbxassetid://120485483338515",
  Button_Book_Map: "rbxassetid://126587941578717",
  Button_Book_Crafting: "rbxassetid://125673038077458",
  Button_Book_Help: "rbxassetid://85619994462094",
  Button_Book_Options: "rbxassetid://130775053254795",
  Button_Book_Exit: "rbxassetid://84638639671372",
  Button_Orange: "rbxassetid://127532649463801",
  Button_Arrow01: "rbxassetid://103041650760979",
  Button_Arrow03: "rbxassetid://92698752605179",
  Button_Cantrips: "rbxassetid://136630593357699",
  Button_Character_Badges: "rbxassetid://128435937893021",
  Button_Character_Craft: "rbxassetid://113165315235506",
  Button_Character_PvP: "rbxassetid://100779081036817",
  Button_Character_Stats: "rbxassetid://111483640006473",
  Button_Character_Stats_Advanced: "rbxassetid://123881093047625",
  Button_Fishing: "rbxassetid://111583964569642",
  Button_Garden_Badges: "rbxassetid://90868096764798",
  Button_Gift: "rbxassetid://111454862184777",
  Button_Green: "rbxassetid://92767168126481",
  Button_Lock: "rbxassetid://71430576966935",
  Button_Magic_Weaving: "rbxassetid://99588835835308",
  Button_Member_Benefit: "rbxassetid://91019395772021",
  Button_Monster_Magic: "rbxassetid://108357777133453",
  Button_Red: "rbxassetid://88520434712759",
  Button_Tab_Timer: "rbxassetid://85815117152491",
  Button_Unlock: "rbxassetid://94187873791109",

  // card designs
  FireCard: "rbxassetid://97523274760958",
  IceCard: "rbxassetid://84099647110981",
  StormCard: "rbxassetid://88379212218094",
  LifeCard: "rbxassetid://101134100066744",
  DeathCard: "rbxassetid://72723804220284",
  MythCard: "rbxassetid://115481298708687",
  BalanceCard: "rbxassetid://97014241139957",
  StellarCard: "rbxassetid://122497493236688",
  LunarCard: "rbxassetid://125470479987755",
  SolarCard: "rbxassetid://95611570535764",
  ShadowCard: "rbxassetid://104397561513873",
  SchoolCardBW: "rbxassetid://108423428591678",
  TreasureCard: "rbxassetid://81720140056355",
  TreasureCardBW: "rbxassetid://98251373890945",
  ItemCard: "rbxassetid://115349437779766",
  ItemCardBW: "rbxassetid://79434633936418",
  CardSelectionBorder: "rbxassetid://87667962604394",

  // character sheet
  Art_Badge05: "rbxassetid://95763122056158",
  Art_Character_Alpha: "rbxassetid://81813058258524",
  Art_Character_Cover02: "rbxassetid://77447860040142",
  Art_Character_PVP: "rbxassetid://110173636372447",
  Art_Character_TimerSlot: "rbxassetid://84329679164935",
  Art_Health: "rbxassetid://109142682650523",
  Art_Member_Benefit_Glow: "rbxassetid://126551896070741",
  Art_Member_Benefit_Rays: "rbxassetid://87706380279543",
  Art_Member_Benefit_Star: "rbxassetid://88541541881905",
  Art_Message_Box02_T: "rbxassetid://104153907462366",
  Art_Message_Box02_B: "rbxassetid://114838091490927",
  Art_Message_Box02_L: "rbxassetid://136156767816545",
  Art_Message_Box02_R: "rbxassetid://109426196425586",
  Art_Message_Box02_TL: "rbxassetid://115709589170420",
  Art_Message_Box02_TR: "rbxassetid://88007225606876",
  Art_Message_Box02_BL: "rbxassetid://83449237981324",
  Art_Message_Box02_BR: "rbxassetid://117328696718113",
  PetGameDerby_MedalGold: "rbxassetid://105736842757143",
  PetGameDerby_MedalSilver: "rbxassetid://76859043565021",
  PetGameDerby_MedalBronze: "rbxassetid://122238244565183",
  PetGameDerby_MedalAluminium: "rbxassetid://119466859178933",
  Energy_Back: "rbxassetid://117849125837393",
  Energy_Liquid: "rbxassetid://111251790552530",
  Energy_Chop_Anim: "rbxassetid://92696299571316"
} as const;

/** Spell card art, keyed by `SpellDescriptor.cardArtSpritesheetNumber` (1-indexed) - see `BaseCardButton`. */
export const cardArtSpritesheets: { colored: string; grayscale: string; }[] = [
  {
    colored: "rbxassetid://89063483535157",
    grayscale: "rbxassetid://131276102206825"
  }, {
    colored: "rbxassetid://72199822054271",
    grayscale: "rbxassetid://119954144892949"
  }, {
    colored: "rbxassetid://91690438885961",
    grayscale: "rbxassetid://98063103618595"
  }, {
    colored: "rbxassetid://94488975783253",
    grayscale: "rbxassetid://85031341614899"
  }, {
    colored: "rbxassetid://102232008786766",
    grayscale: "rbxassetid://75341543912308"
  }, {
    colored: "rbxassetid://78641261208589",
    grayscale: "rbxassetid://103461797304495"
  }
];
