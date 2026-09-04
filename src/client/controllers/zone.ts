import { Controller } from "@flamework/core";
import { source, type Source } from "@rbxts/vide";

import { Message, type MessageData } from "shared/messaging";
import { OnClientMessage } from "shared/meta";
import type { ZoneID } from "shared/structs/zone";

@Controller()
export class ZoneController {
  public readonly currentZone: Source<Maybe<ZoneID>> = source<Maybe<ZoneID>>(undefined);

  /** @hidden */
  @OnClientMessage(Message.Zone_Entered)
  public onZoneEntered(zoneID: MessageData[Message.Zone_Entered]): void {
    this.currentZone(zoneID);
  }
}
