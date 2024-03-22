import type { OnStart } from "@flamework/core";
import { Component, BaseComponent } from "@flamework/components";
import { Workspace as World, TextService as Text } from "@rbxts/services";

const MARGIN = 0.02;

@Component({
  tag: "AutoSizedText",
  ancestorWhitelist: [ World ]
})
export class AutoSizedText extends BaseComponent<{}, TextLabel | TextButton | TextBox> implements OnStart {
  private readonly container = <Frame>this.instance.Parent;
  private readonly screen = this.instance.FindFirstAncestorWhichIsA("LayerCollector")!;

  public onStart(): void {
    this.update();
    this.screen.GetPropertyChangedSignal("AbsoluteSize")
      .Connect(() => this.update());
  }

  private update(): void {
    const textSize = (this.container.Size.Y.Scale * this.screen.AbsoluteSize.Y) - 1;
    this.instance.TextSize = textSize;

    const params = new Instance("GetTextBoundsParams");
    params.Text = this.instance.Text;
    params.Font = this.instance.FontFace;
    params.Width = this.container.AbsoluteSize.X;
    params.Size = textSize;

    const textBounds = Text.GetTextBoundsAsync(params);
    this.instance.Size = UDim2.fromScale((textBounds.X / this.container.AbsoluteSize.X) + MARGIN, 1);
  }
}