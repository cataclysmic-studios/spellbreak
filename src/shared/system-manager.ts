import { RunService } from "@rbxts/services";
import { Loop, System } from "@rbxts/matter";
import { getDescendantsOfType } from "@rbxts/instance-utility";

import { world } from "./worlds";

export class SystemManager {
  private readonly loop = new Loop(world);

  public start(): void {
    this.loop.begin({
      default: RunService.Heartbeat,
      render: RunService.RenderStepped,
      step: RunService.Stepped,
    });
  }

  public loadFromRoot(instance: Instance): void {
    const systems = getDescendantsOfType(instance, "ModuleScript")
      .mapFiltered(require<System<[]>>);

    this.load(...systems);
  }

  public load(...systems: System<[]>[]): void {
    print("scheduling systems:", systems)
    this.loop.scheduleSystems(systems);
  }
}