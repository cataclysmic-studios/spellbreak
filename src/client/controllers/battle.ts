import { Controller, type OnInit } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import Signal from "@rbxts/signal";

import { Events } from "client/network";
import type { CharacterData } from "shared/data-models/character-data";
import BattleClient from "client/classes/battle-client";
import Log from "shared/logger";

import type { CameraController } from "./camera";
import type { CharacterController } from "./character";
import type CharacterHelper from "shared/helpers/character";

@Controller()
export class BattleController implements OnInit {
  public readonly entered = new Signal<() => void>;
  public readonly left = new Signal<() => void>;
  public readonly turnStarted = new Signal<() => void>;
  private client?: BattleClient;

  public constructor(
    private readonly camera: CameraController,
    private readonly character: CharacterController,
    private readonly characterHelper: CharacterHelper
  ) { }

  public onInit(): void {
    Events.battle.createClient.connect((battleCircleID, team, opponents, characterData) => this.initializeClient(battleCircleID, team, opponents, <CharacterData>characterData));
  }

  public getClient(): Maybe<BattleClient> {
    return this.client;
  }

  private async initializeClient(battleCircleID: string, team: Model[], opponents: Model[], characterData: CharacterData): Promise<void> {
    const battleCircle = <ReplicatedFirst["Assets"]["Battle"]["BattleCircle"]>World.BattleCircles.GetChildren().find(circle => circle.GetAttribute("ID") === battleCircleID);
    if (battleCircle === undefined)
      return Log.warning(`Failed to initialize BattleClient: Could not find battle circle model with ID "${battleCircleID}"`);

    this.client = new BattleClient(
      this, this.character, this.camera, this.characterHelper,
      characterData, team, opponents, battleCircle
    );
  }
}