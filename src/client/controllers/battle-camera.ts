import { Controller, type OnRender, type OnInit } from "@flamework/core";
import { TweenInfoBuilder } from "@rbxts/builders";
import { Workspace as World } from "@rbxts/services";

import { Events } from "client/network";
import { tween } from "shared/utility/ui";
import BattleCameraState from "shared/structs/battle-camera-state";

const TWEEN_TO_STATES: BattleCameraState[] = [BattleCameraState.ChoosingCards, BattleCameraState.Summon];
const TWEEN_INFO = new TweenInfoBuilder().SetTime(1);

@Controller()
export class BattleCameraController implements OnInit, OnRender {
  private readonly defaultCamera = World.CurrentCamera!;
  private readonly camera = this.defaultCamera.Clone();
  private state = BattleCameraState.None;
  private enabled = false;

  public onInit(): void {
    this.camera.Name = "BattleCamera";
    this.camera.Parent = World;
    Events.battle.setCameraState.connect((battleCircleID, state) => this.setState(battleCircleID, state));
  }

  public onRender(dt: number): void {
    if (!this.enabled) return;
    switch(this.state) {
      case BattleCameraState.Cast: {
        // TODO: position in front of character battle position
        break;
      }
      case BattleCameraState.PetCast: {
        // TODO: position in front of character battle position, looking at and zoomed in on the pet
        break;
      }
      case BattleCameraState.Spell: {
        // TODO: set battle camera's cframe to spell camera's cframe (or something similar)
        break;
      }
    }
  }

  public setState(battleCircleID: string, state: BattleCameraState): void {
    if (!TWEEN_TO_STATES.includes(state)) return;

    let cameraOffset = new CFrame;
    switch(state) {
      case BattleCameraState.ChoosingCards: {

        break;
      }
      case BattleCameraState.Summon: {
        break;
      }
    }

    tween(this.camera, TWEEN_INFO, {
      CFrame: this.defaultCamera.CFrame.mul(cameraOffset)
    });
  }
}