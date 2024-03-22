import { Component, type Components } from "@flamework/components";
import { TweenInfoBuilder } from "@rbxts/builders";

import { tween } from "shared/utility/ui";
import DestroyableComponent from "shared/base-components/destroyable-component";

import type { BattleCircle } from "./battle-circle";

// TODO: glow animations
@Component({ tag: "BattleTriangle" })
export class BattleTriangle extends DestroyableComponent<{}, ReplicatedFirst["Assets"]["BattleTriangle"]> {
  public readonly battleCircle: BattleCircle;
  private spinTweenInfo = new TweenInfoBuilder()
    .SetTime(0.25);

  public constructor(components: Components) {
    super();
    this.battleCircle = components.getComponent(this.instance.Parent!)!;
  }

  public pointAt(position: Vector3, doTween = true): void {
    const newPosition = this.battleCircle.instance.Main.Position.add(new Vector3(0, 0.15, 0))
    let destination = CFrame.lookAt(newPosition, position);
    destination = destination.add(destination.LookVector.mul(6.25));

    if (doTween) {
      tween(this.instance, this.spinTweenInfo, { CFrame: destination })
        .Completed.Once(() => this.flash());
    } else {
      this.instance.CFrame = destination;
      this.flash();
    }
  }

  private flash(): void {

  }
}