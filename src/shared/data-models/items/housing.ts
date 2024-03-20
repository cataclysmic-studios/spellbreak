import type { CharacterItem } from "./base";

export const enum HousingCategory {
  Castle = "Castle",
  PlantLife = "Plant Life",
  Wall = "Wall",
  Wallpaper = "Wallpaper",
  Outdoors = "Outdoors",
  Furniture = "Furniture",
  Decoration = "Decoration",
  MusicScrolls = "Music Scrolls",
  Seeds = "Seeds"
}

export interface Housing extends CharacterItem {
  readonly category: HousingCategory;
}