import type { CharacterItem } from ".";

export const enum HousingCategory {
  Castle,
  PlantLife,
  Wall,
  Wallpaper,
  Outdoors,
  Furniture,
  Decoration,
  MusicScrolls,
  Seeds
}

export interface Housing extends CharacterItem {
  readonly category: HousingCategory;
}