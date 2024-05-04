import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import Object from "@rbxts/object-utils";

import type { School } from "shared/data-models/school";
import { Events } from "client/network";
import { Player, PlayerGui } from "shared/utility/client";
import { isEven } from "shared/utility/numbers";
import { flatten } from "shared/utility/array";
import { Range } from "shared/utility/range";
import Spells from "shared/default-structs/spells";
import SpellsList from "shared/default-structs/spells/list";
import Log from "shared/logger";

import DestroyableComponent from "shared/base-components/destroyable";
import type { BattleController } from "client/controllers/battle";

const { floor } = math;

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

  private readonly mouse = Player.GetMouse();

  public constructor(
    private readonly components: Components,
    private readonly battle: BattleController
  ) { super(); }

  public onStart(): void {
    if (!this.associatedSpell)
      throw new Log.Exception("InvalidSpellOrSchool", `Tried to find spell in school ${this.attributes.CardButton_School} named "${this.attributes.CardButton_Name}"`);

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
    const battleClient = this.battle.getClient();
    if (battleClient === undefined)
      return Player.Kick("stop tinkering bitch");

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
    for (const card of this.components.getAllComponents<CardButton>())
      task.spawn(() => {
        card.selectionBorder.Enabled = card.is(this);
        card.selected = card.is(this);
      });
  }

  private deselectAll(): void {
    for (const card of this.components.getAllComponents<CardButton>())
      task.spawn(() => {
        card.selectionBorder.Enabled = false;
        card.selected = false;
      });
  }

  private canCast(): boolean {
    const battleClient = this.battle.getClient()!
    const pipCost = this.getPipCost();
    return battleClient.characterData.stats.mana >= pipCost
      && battleClient.getTotalPips() >= pipCost
      && battleClient.getShadowPips() >= this.getShadowPipCost()
  }

  private getPipCost(): number {
    const spellCost = this.associatedSpell.cost;
    const battleClient = this.battle.getClient()!;
    return spellCost.pips === "X" ? battleClient.getTotalPips() : spellCost.pips;
  }

  private getShadowPipCost(): number {
    return this.associatedSpell.cost.shadowPips;
  }
}