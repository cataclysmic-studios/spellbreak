import { Component, Entity, World } from "@rbxts/matter";

import { Character } from "shared/components";

export class EntityFactory {
  public static character(world: World, data: Character): Entity<[Component<Character>]> {
    return world.spawn(Character(data));
  }
}