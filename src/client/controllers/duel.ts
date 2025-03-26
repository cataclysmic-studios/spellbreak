import { Controller } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import type { BaseID } from "@rbxts/id";

import { OnMessage } from "client/decorators";
import { Message, type MessageData } from "shared/messaging";
import Log from "shared/log";

export interface ClientDuelInfo extends BaseID<number> {
  readonly model: DuelCircleModel;
  readonly onOpposingTeam: boolean;
}

@Controller()
export class DuelController {
  private current?: ClientDuelInfo;

  /** @hidden */
  @OnMessage(Message.DuelInitializeClient)
  public initializeClient({ id, onOpposingTeam }: MessageData[Message.DuelInitializeClient]): void {
    const model = this.getCircleModelByID(id);
    if (model === undefined)
      return Log.warn(`Failed to initialize duel on client - could not find duel circle model with ID ${id}`, ["duel controller"]);

    this.current = { id, onOpposingTeam, model };
  }

  public getCircleModelByID(id: number): Maybe<DuelCircleModel> {
    return World.DuelCircles.GetChildren()
      .find((duelCircle): duelCircle is DuelCircleModel => duelCircle.GetAttribute("ID") === id);
  }

  public getCurrentInfo(): Maybe<ClientDuelInfo> {
    return this.current;
  }
}