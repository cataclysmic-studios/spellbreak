import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

@Component({ tag: "CharacterCollisions" })
export class CharacterCollisions extends BaseComponent<{}, Model> implements OnStart {
  public onStart(): void {
    for (const part of this.instance.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
      part.CollisionGroup = "Character";
  }
}