import { Controller, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import Signal from "@rbxts/signal";

import { Events } from "client/network";
import BattleClient from "client/classes/battle-client";

import type { CameraController } from "./camera";
import Log from "shared/logger";

@Controller()
export class BattleController implements OnInit {
  public readonly deckUIToggled = new Signal<(on: boolean) => void>;

  public constructor(
    private readonly camera: CameraController
  ) { }

  public onInit(): void {
    Events.battle.createClient.connect((battleCircleID, opponent) => this.initializeClient(battleCircleID, opponent));
  }

  private initializeClient(battleCircleID: string, opponent: boolean): void {
    const battleCircle = <ReplicatedFirst["Assets"]["Battle"]["BattleCircle"]>World.BattleCircles.GetChildren().find(circle => circle.GetAttribute("ID") === battleCircleID);
    if (battleCircle === undefined)
      return Log.warning(`Failed to initialize BattleClient: Could not find battle circle model with ID "${battleCircleID}"`);

    const battleClient = new BattleClient(this, this.camera, battleCircle, opponent);
  }
}