import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";

import { getInstancePath } from "shared/utility/instances";
import Log from "shared/logger";

interface Attributes {
  readonly Collider_ExtraHeight: number;
  readonly Collider_ExtraArea: number;
}

@Component({
  tag: "Collider",
  defaults: {
    Collider_ExtraHeight: 50,
    Collider_ExtraArea: 0
  }
})
export class Collider extends BaseComponent<Attributes, BasePart | Model> implements OnStart {
  public onStart(): void {
    if (this.instance.IsA("BasePart") && !this.instance.Anchored)
      Log.warning("A collider was added to an unanchored part:", getInstancePath(this.instance));

    if (this.instance.IsA("BasePart"))
      this.instance.CanCollide = false;
    else
      for (const part of this.instance.GetDescendants().filter((i): i is BasePart => i.IsA("BasePart")))
        part.CanCollide = false;

    const extraHeight = new Vector3(0, this.attributes.Collider_ExtraHeight, 0);
    const extraArea = new Vector3(this.attributes.Collider_ExtraArea, 0, this.attributes.Collider_ExtraArea);
    const objectSize = this.instance.IsA("Model") ? this.instance.GetBoundingBox()[1] : this.instance.Size;
    const objectPosition = this.instance.IsA("Model") ? this.instance.GetPivot().Position : this.instance.Position;
    const collider = new Instance("Part");
    collider.Name = "Collider";
    collider.Transparency = 1;
    collider.Anchored = true;
    collider.Size = objectSize.add(extraHeight).add(extraArea);
    collider.Position = objectPosition.add(extraHeight.div(2));
    collider.Parent = this.instance;
  }
}