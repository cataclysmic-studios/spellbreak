import type { OnStart } from "@flamework/core";
import { Component } from "@flamework/components";
import { Players } from "@rbxts/services";
import { startsWith } from "@rbxts/string-utils";

import { Assets } from "shared/utility/instances";
import type { School } from "shared/data-models/school";
import DestroyableComponent from "shared/base-components/destroyable";

import type { BattleService } from "server/services/battle";
import { LARGE_SCHOOL_ICON_OVERHEAD, LARGE_SCHOOL_ICON_OFFSETS } from "shared/constants";
import { Events } from "server/network";

interface Attributes {
  Rank: number;
  School: School;
  Title: EnemyTitle;
}

interface EnemyModel extends Model {
  PrimaryPart: BasePart;
  Humanoid: Humanoid;
}

const enum EnemyTitle {
  Regular = "Regular",
  Regular2 = "Regular2",
  Elite = "Elite",
  Boss = "Boss"
}

const NAMETAG_COLORS: Record<EnemyTitle, Color3> = {
  [EnemyTitle.Regular]: Color3.fromRGB(255, 255, 0),
  [EnemyTitle.Regular2]: Color3.fromRGB(255, 163, 0),
  [EnemyTitle.Elite]: Color3.fromRGB(255, 0, 0),
  [EnemyTitle.Boss]: Color3.fromRGB(122, 33, 209),
};

@Component({ tag: "Enemy" })
export class Enemy extends DestroyableComponent<Attributes, EnemyModel> implements OnStart {
  public constructor(
    private readonly battle: BattleService
  ) { super(); }

  public onStart(): void {
    this.janitor.Add(this.instance);
    this.instance.Humanoid.NameDisplayDistance = 0;
    this.instance.Humanoid.HealthDisplayDistance = 0;

    this.createNametag();
    this.registerTouch();
  }

  private createNametag(): void {
    const nametag = Assets.UI.EnemyNametag.Clone();
    nametag.Title.Text = this.instance.Name.upper();
    nametag.Title.TextColor3 = NAMETAG_COLORS[this.attributes.Title];
    nametag.Bottom.Info.Text = `RANK ${this.attributes.Rank}${startsWith(this.attributes.Title, "Regular") ? "" : " " + this.attributes.Title.upper()}`;
    nametag.Bottom.Info.TextColor3 = NAMETAG_COLORS[this.attributes.Title];
    nametag.Bottom.SchoolIcon.Image = LARGE_SCHOOL_ICON_OVERHEAD;
    nametag.Bottom.SchoolIcon.ImageRectSize = new Vector2(52, 52);
    nametag.Bottom.SchoolIcon.ImageRectOffset = LARGE_SCHOOL_ICON_OFFSETS[this.attributes.School];
    nametag.Adornee = this.instance.PrimaryPart;
    nametag.Parent = this.instance;

    Events.general.addTag.broadcast(nametag.Bottom.Info.GetFullName(), "AutoSizedText");
  }

  private registerTouch(): void {
    const touchConn = this.instance.PrimaryPart.Touched.Connect(hit => {
      const playerWhoTouched = <Maybe<Player>>Players.FindFirstChild(hit.FindFirstAncestorOfClass("Model")?.Name ?? "");
      if (!playerWhoTouched) return;
      touchConn.Disconnect();

      this.battle.startPvE(playerWhoTouched, this);
    });
  }
}