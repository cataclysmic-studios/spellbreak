import { BadgeCategory } from "./character-data";

export interface CharacterBadge {
  readonly name: string;
  readonly category: BadgeCategory;
}