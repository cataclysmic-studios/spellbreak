import { Controller, type OnStart } from "@flamework/core";
import Vide, { mount, source } from "@rbxts/vide";

import { Message, messaging, type MessageData } from "shared/messaging";
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

  // Acks right after starting the cover animation, not after it's actually finished - the
  // server blocks the teleport on this ack (see `ZoneService.transferToZone`) specifically so
  // it can't land before the screen is at least on its way to covering it, not so it has to wait
  // out the whole animation.
  /** @hidden */
  @OnClientMessage(Message.Zone_Transferring)
  public onZoneTransferring(zoneID: MessageData[Message.Zone_Transferring]): void {
    this.play();
    messaging.server.emit(Message.Zone_TransferCoverReady, zoneID);
  }

  private play(): void {
    this.trigger(this.trigger() + 1);
  }
}
