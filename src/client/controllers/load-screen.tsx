import { Controller, type OnStart } from "@flamework/core";
import Vide, { mount, source } from "@rbxts/vide";

import { Message } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import { playerGui } from "client/constants";

import { LoadScreen } from "shared/ui/components/load-screen";

@Controller()
export class LoadScreenController implements OnStart {
  private readonly trigger = source(0);

  public constructor() {
    mount(() => <LoadScreen trigger={this.trigger} />, playerGui);
  }

  public onStart(): void {
    if (!game.IsLoaded())
      game.Loaded.Wait();

    this.play();
  }

  /** @hidden */
  @OnClientMessage(Message.Zone_Transferring)
  public onZoneTransferring(): void {
    this.play();
  }

  private play(): void {
    this.trigger(this.trigger() + 1);
  }
}
