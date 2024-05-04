import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import { Workspace as World } from "@rbxts/services";
import { Janitor } from "@rbxts/janitor";
import Object from "@rbxts/object-utils";

import type { School } from "shared/data-models/school";
import { Events } from "client/network";
import { Assets } from "shared/utility/instances";
import { Player, PlayerGui } from "shared/utility/client";
import { isEven } from "shared/utility/numbers";
import { flatten } from "shared/utility/array";
import { Range } from "shared/utility/range";
import type BattleClient from "client/classes/battle-client";
import Spells from "shared/default-structs/spells";
import SpellsList from "shared/default-structs/spells/list";
import Log from "shared/logger";

import DestroyableComponent from "shared/base-components/destroyable";
import type SpellHelper from "shared/helpers/spell";
import type { BattleController } from "client/controllers/battle";

const { floor, rad } = math;

const OPPONENT_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(247, 64, 204),
  Color3.fromRGB(255, 56, 96),
  Color3.fromRGB(255, 196, 46),
  Color3.fromRGB(251, 255, 44)
];
const TEAM_SELECTION_COLORS: Color3[] = [
  Color3.fromRGB(154, 255, 21),
  Color3.fromRGB(10, 255, 182),
  Color3.fromRGB(82, 186, 255),
  Color3.fromRGB(137, 108, 255)
]

const SELECTION_BORDER_TEMPLATE = new Instance("UIStroke");
SELECTION_BORDER_TEMPLATE.Thickness = 1.6;
SELECTION_BORDER_TEMPLATE.Transparency = 0.2;
SELECTION_BORDER_TEMPLATE.Color = new Color3(1, 1, 1);
SELECTION_BORDER_TEMPLATE.LineJoinMode = Enum.LineJoinMode.Round;
SELECTION_BORDER_TEMPLATE.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;

interface Attributes {
  readonly CardButton_Name: string;
  readonly CardButton_School: School;
  readonly CardButton_TreasureCard: boolean;
}

@Component({
  tag: "CardButton",
  ancestorWhitelist: [PlayerGui]
})
export class CardButton extends DestroyableComponent<Attributes, ImageButton> implements OnStart {
  public readonly selectionBorder = SELECTION_BORDER_TEMPLATE.Clone();
  public associatedSpell = flatten(Object.values(<SpellsList>Spells[this.attributes.CardButton_School])).find(spell => spell.name === this.attributes.CardButton_Name)!;
  public selected = false;

  private readonly selectionStorage = new Instance("Folder", World);
  private readonly selectionJanitor = new Janitor;
  private readonly mouse = Player.GetMouse();

  public constructor(
    private readonly components: Components,
    private readonly battle: BattleController,
    private readonly spellHelper: SpellHelper
  ) { super(); }

  public onStart(): void {
    if (!this.associatedSpell)
      throw new Log.Exception("InvalidSpellOrSchool", `Tried to find spell in school ${this.attributes.CardButton_School} named "${this.attributes.CardButton_Name}"`);

    this.selectionStorage.Name = "SelectionStorage";
    this.selectionBorder.Parent = this.instance;
    this.janitor.LinkToInstance(this.instance, true);
    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => {
      if (!this.associatedSpell.hasTarget)
        return this.castAssociatedSpell();

      this.select();
    }));
    this.janitor.Add(this.mouse.Button2Down.Connect(() => this.discard()));
    this.janitor.Add(this.mouse.Button1Down.Connect(() => {
      const { X, Y } = this.mouse;
      const position = this.instance.AbsolutePosition;
      const size = this.instance.AbsoluteSize;
      const dimensionsX = new Range(position.X, position.X + size.X);
      const dimensionsY = new Range(position.Y, position.Y + size.Y);

      if (dimensionsX.numberIsWithin(X) && dimensionsY.numberIsWithin(Y)) return;
      if (this.associatedSpell.cost.pips === "X") // TODO: else if an enemy was clicked on
        return this.castAssociatedSpell();

      this.deselectAll();
    }));

    this.deselectAll();
  }

  public is(otherCard: CardButton): boolean {
    return otherCard.instance === this.instance && otherCard.attributes === this.attributes;
  }

  private castAssociatedSpell(): void {
    const battleClient = this.getBattleClient();
    if (!this.canCast()) return; // TODO: also grey out card

    const { shadowPips } = this.associatedSpell.cost;
    const pipsToUse = this.getPipCost();
    if (isEven(pipsToUse))
      battleClient.usePowerPips(pipsToUse / 2);
    else {
      battleClient.usePowerPips(floor(pipsToUse / 2));
      battleClient.usePips(pipsToUse % 2);
    }

    Events.character.updateStats(stats => stats.mana -= pipsToUse + shadowPips);
    // TODO: when spell casting starts call this.destroy();
  }

  private discard(): void {
    this.destroy();
  }

  private select(): void {
    const selectionColors = this.spellHelper.targetsTeam(this.associatedSpell) ? TEAM_SELECTION_COLORS : OPPONENT_SELECTION_COLORS;
    let i = 0;
    for (const opponent of this.getBattleClient().opponents) {
      const color = selectionColors[i];
      const selection = this.selectionJanitor.Add(Assets.Battle.Selection.Clone());
      for (const decal of selection.GetDescendants().filter((i): i is Decal => i.IsA("Decal")))
        decal.Color3 = color;

      const pivot = opponent.GetPivot();
      const postion = pivot.Position.add(new Vector3(0, 1, 0));
      selection.PivotTo(CFrame.lookAlong(postion, pivot.LookVector).mul(CFrame.Angles(0, 0, rad(90))));
      selection.Parent = this.selectionStorage;
      i++;
    }

    for (const card of this.components.getAllComponents<CardButton>())
      task.spawn(() => {
        card.selectionBorder.Enabled = card.is(this);
        card.selected = card.is(this);
      });
  }

  private deselectAll(): void {
    this.selectionJanitor.Cleanup();
    for (const card of this.components.getAllComponents<CardButton>())
      task.spawn(() => {
        card.selectionBorder.Enabled = false;
        card.selected = false;
      });
  }

  private getBattleClient(): BattleClient {
    const battleClient = this.battle.getClient();
    if (battleClient === undefined)
      return <BattleClient><unknown>Player.Kick("stop tinkering bitch");

    return battleClient;
  }

  private canCast(): boolean {
    const battleClient = this.getBattleClient();
    const pipCost = this.getPipCost();
    return battleClient.characterData.stats.mana >= pipCost
      && battleClient.getTotalPips() >= pipCost
      && battleClient.getShadowPips() >= this.getShadowPipCost()
  }

  private getPipCost(): number {
    const spellCost = this.associatedSpell.cost;
    const battleClient = this.getBattleClient();
    return spellCost.pips === "X" ? battleClient.getTotalPips() : spellCost.pips;
  }

  private getShadowPipCost(): number {
    return this.associatedSpell.cost.shadowPips;
  }
}