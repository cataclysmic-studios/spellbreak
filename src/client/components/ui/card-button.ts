import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";
import Object from "@rbxts/object-utils";

import type { School } from "shared/data-models/school";
import { Player, PlayerGui } from "shared/utility/client";
import { flatten } from "shared/utility/array";
import DestroyableComponent from "shared/base-components/destroyable";
import Range from "shared/utility/range";
import Spells from "shared/structs/spells";
import SpellsList from "shared/structs/spells/list";
import Log from "shared/logger";

const SELECTION_BORDER_TEMPLATE = new Instance("UIStroke");
SELECTION_BORDER_TEMPLATE.Thickness = 1.6;
SELECTION_BORDER_TEMPLATE.Transparency = 0.2;
SELECTION_BORDER_TEMPLATE.Color = new Color3(1, 1, 1);
SELECTION_BORDER_TEMPLATE.LineJoinMode = Enum.LineJoinMode.Round;
SELECTION_BORDER_TEMPLATE.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;

interface Attributes {
  School: School;
  SpellName: string;
}

@Component({
  tag: "CardButton",
  ancestorWhitelist: [PlayerGui]
})
export class CardButton extends DestroyableComponent<Attributes, ImageButton> implements OnStart {
  public readonly selectionBorder = SELECTION_BORDER_TEMPLATE.Clone();
  public associatedSpell = flatten(Object.values(<SpellsList>Spells[this.attributes.School])).find(spell => spell.name === this.attributes.SpellName)!;
  public selected = false;

  private readonly mouse = Player.GetMouse();

  public constructor(
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
    if (!this.associatedSpell)
      throw new Log.Exception("InvalidSpellOrSchool", `Tried to find spell in school ${this.attributes.School} named "${this.attributes.SpellName}"`);

    this.selectionBorder.Parent = this.instance;
    this.janitor.Add(this.instance);
    this.janitor.Add(this.instance.MouseButton1Click.Connect(() => this.select()));
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
  }

  public is(otherCard: CardButton): boolean {
    return otherCard.instance === this.instance && otherCard.attributes === this.attributes;
  }

  private castAssociatedSpell(): void {
    this.destroy();
  }

  private select(): void {
    for (const card of this.components.getAllComponents<CardButton>()) {
      card.selectionBorder.Enabled = card.is(this);
      card.selected = card.is(this);
    }
  }

  private deselectAll(): void {
    for (const card of this.components.getAllComponents<CardButton>()) {
      card.selectionBorder.Enabled = false;
      card.selected = false;
    }
  }

  private canCast(): boolean {
    // check pip counts
    return true;
  }
}