import { Controller, type OnStart } from "@flamework/core";
import { ContentProvider } from "@rbxts/services";
import Object from "@rbxts/object-utils";

import { assets, spellKindImages } from "shared/constants";
import { Images, cardArtSpritesheets } from "shared/ui/utility/images";
import Log from "shared/log";

const log = Log.scoped("asset preload");

@Controller()
export class AssetPreloadController implements OnStart {
  public onStart(): void {
    const content: (Instance | string)[] = [
      ...assets.GetDescendants(),
      ...Object.values(Images),
      ...Object.values(spellKindImages),
      ...cardArtSpritesheets.map(({ colored }) => colored),
      ...cardArtSpritesheets.map(({ grayscale }) => grayscale)
    ];

    task.spawn(() => {
      const startTime = os.clock();
      ContentProvider.PreloadAsync(content);
      log.debug(`preloaded ${content.size()} piece(s) of content in ${"%.3f".format(os.clock() - startTime)}s`);
    });
  }
}
