import type { OnStart } from "@flamework/core";
import { Component, Components } from "@flamework/components";

import type { Spell } from "shared/structs/spell";
import { Player, PlayerGui } from "shared/utility/client";
import DestroyableComponent from "client/base-components/destroyable-component";
import Range from "shared/utility/range";

const SELECTION_BORDER_TEMPLATE = new Instance("UIStroke");
SELECTION_BORDER_TEMPLATE.Thickness = 1.6;
SELECTION_BORDER_TEMPLATE.Transparency = 0.2;
SELECTION_BORDER_TEMPLATE.Color = new Color3(1, 1, 1);
SELECTION_BORDER_TEMPLATE.LineJoinMode = Enum.LineJoinMode.Round;
SELECTION_BORDER_TEMPLATE.ApplyStrokeMode = Enum.ApplyStrokeMode.Border;

@Component({
  tag: "CardButton",
  ancestorWhitelist: [ PlayerGui ]
})
export class CardButton extends DestroyableComponent<{}, ImageButton> implements OnStart {
  public readonly selectionBorder = SELECTION_BORDER_TEMPLATE.Clone();
  public associatedSpell?: Spell;
  public selected = false;

  private readonly mouse = Player.GetMouse();

  public constructor(
    private readonly components: Components
  ) { super(); }

  public onStart(): void {
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
      if (this.associatedSpell?.cost.pips === "X") // TODO: else if an enemy was clicked on
        return this.castAssociatedSpell();

      this.deselectAll();
    }));
  }

  private castAssociatedSpell(): void {
    this.destroy();
  }

  private select(): void {
    for (const card of this.components.getAllComponents<CardButton>()) {
      card.selectionBorder.Enabled = card === this;
      card.selected = card === this;
    }
  }

  private deselectAll(): void {
    for (const card of this.components.getAllComponents<CardButton>()) {
      card.selectionBorder.Enabled = false;
      card.selected = false;
    }
  }
}