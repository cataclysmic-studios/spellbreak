import { Players } from "@rbxts/services";
import { useEvent, type Entity, type SystemStruct } from "@rbxts/matter";

import { world } from "shared/worlds";
import { EntityFactory } from "shared/entity-factory";

export = {
  event: "render",
  system: () => {
    for (const [_, character] of useEvent(Players.LocalPlayer, "CharacterAdded")) {
      const entity = EntityFactory.character(world, {
        model: character,
        velocity: Vector3.zero
      });

      character.SetAttribute("Entity", entity);
    }
    for (const [_, character] of useEvent(Players.LocalPlayer, "CharacterRemoving")) {
      const entity = character.GetAttribute<Entity>("Entity");
      if (entity === undefined) continue;

      world.despawn(entity);
    }
  }
} satisfies SystemStruct<[]>;