import { Controller, type OnStart } from "@flamework/core";
import { StandardActionBuilder } from "@rbxts/mechanism";
import { processDependencies } from "@rbxts/flamework-meta-utils";
import Iris from "@rbxts/iris";

import { OnInput } from "client/decorators";
import { createMappingDecorator } from "shared/meta";
import type { ControlPanelInterfaceRenderer } from "shared/structs/control-panel";

const [renderableMeta, ControlPanelRenderable] = createMappingDecorator<ControlPanelInterfaceRenderer, never[], [interfaceName: string, order?: number]>();
export { ControlPanelRenderable };

interface Renderable {
  readonly renderer: ControlPanelInterfaceRenderer;
  readonly interfaceName: string;
  readonly order?: number;
}

@Controller()
export class ControlPanelController implements OnStart {
  private readonly windowSize = new Vector2(300, 400);
  private readonly windowOpened = Iris.State(false);
  private readonly renderables: Renderable[] = [];

  public onStart(): void {
    for (const [_, [ctor, [interfaceName, order]]] of renderableMeta)
      processDependencies(ctor, renderer => this.renderables.push({ renderer, interfaceName, order }));

    this.renderables.sort((a, b) => (a.order ?? math.huge + 1) < (b.order ?? math.huge + 1));

    Iris.Init();
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.colorDark);
    Iris.UpdateGlobalConfig(Iris.TemplateConfig.sizeClear);
    Iris.Connect(() => this.render());
  }

  @OnInput(new StandardActionBuilder("Comma"))
  public open(): void {
    this.windowOpened.set(!this.windowOpened.get());
  }

  private render(): void {
    Iris.Window(["Control Panel"], {
      size: Iris.State(this.windowSize),
      isOpened: this.windowOpened
    });
    for (const renderable of this.renderables) {
      Iris.Tree([renderable.interfaceName]);
      renderable.renderer.renderControlPanelInterface();
      Iris.End();
    }
    Iris.End();
  }
}