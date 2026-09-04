import { Controller, type OnStart } from "@flamework/core";
import { CollectionService } from "@rbxts/services";

import { ZoneTunnel } from "client/classes/zone-tunnel";

import type { CharacterController } from "./character";

const TAG = "ZoneTunnel";

@Controller()
export class ZoneTunnelController implements OnStart {
  public constructor(
    private readonly character: CharacterController
  ) { }

  public onStart(): void {
    for (const instance of CollectionService.GetTagged(TAG))
      this.register(instance as TunnelModel);

    // Workspace geometry can still be streaming in when this controller starts, so a tunnel
    // tagged in Studio might not show up in GetTagged yet - catch it whenever it does arrive.
    CollectionService.GetInstanceAddedSignal(TAG).Connect(instance => this.register(instance as TunnelModel));
  }

  private register(model: TunnelModel): void {
    new ZoneTunnel(this.character, model);
  }
}
