import { School } from "./data-models/school";

export const CREATOR_ID = game.CreatorType === Enum.CreatorType.User ? game.CreatorId : 44966864; // add your user ID here if you're the creator
export const DEVELOPERS = [CREATOR_ID]; // add extra developer user IDs here
export const USE_CURLY_BRACES_FOR_UUIDS = false;

export const MAX_BATTLE_COMBATANTS = 4;
export const LARGE_SCHOOL_ICON_OVERHEAD = "rbxassetid://16821859312";
export const LARGE_SCHOOL_ICON_OFFSETS: Record<School, Vector2> = {
  [School.Fire]: new Vector2(364, 52),
  [School.Frost]: new Vector2(416, 52),
  [School.Storm]: new Vector2(104, 104),
  [School.Life]: new Vector2(0, 104),
  [School.Death]: new Vector2(312, 52),
  [School.Myth]: new Vector2(52, 104),
  [School.Balance]: new Vector2(260, 52),
  [School.Solar]: new Vector2(208, 312),
  [School.Lunar]: new Vector2(156, 312),
  [School.Stellar]: new Vector2(104, 312),
  [School.Shadow]: new Vector2(104, 416)
};