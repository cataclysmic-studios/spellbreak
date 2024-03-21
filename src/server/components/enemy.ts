import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { Players } from "@rbxts/services";

import DestroyableComponent from "shared/base-components/destroyable-component";

import type { BattleService } from "server/services/battle";

interface Attributes {}

@Component({ tag: "Enemy" })
export class Enemy extends DestroyableComponent<Attributes, Model & { PrimaryPart: BasePart; }> implements OnStart {
  public constructor(
    private readonly battle: BattleService
  ) { super(); }

  public onStart(): void {
    this.janitor.Add(this.instance);

    const touchConn = this.instance.PrimaryPart.Touched.Connect(hit => {
      const playerWhoTouched = <Maybe<Player>>Players.FindFirstChild(hit.FindFirstAncestorOfClass("Model")?.Name ?? "");
      if (!playerWhoTouched) return;
      touchConn.Disconnect();

      this.battle.startPvE(playerWhoTouched, this);
    });
  }
}