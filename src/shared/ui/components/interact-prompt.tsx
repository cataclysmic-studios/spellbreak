import Vide, { type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { anchorPoints, positions } from "../utility/positioning";
import { getNpcByID } from "shared/utility/npc";
import type { Interactable } from "shared/structs/interactable";

import { PromptPanel } from "./prompt-panel";

interface InteractPromptProps {
  readonly interactable: Source<Maybe<Interactable>>;
  readonly visible: Source<boolean>;
}

export function InteractPrompt({ interactable, visible }: InteractPromptProps): Vide.Node {
  const px = usePx();
  const portrait = () => {
    const id = interactable();
    if (id === undefined) return "";

    return getNpcByID(id).portrait;
  }
  const title = () => {
    const id = interactable();
    if (id === undefined) return "";

    return getNpcByID(id).name;
  }

  const size = px(480);
  return (
    <PromptPanel name="InteractPrompt"
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter.sub(UDim2.fromOffset(0, px(48)))}
      size={UDim2.fromOffset(size, size)}
      title={title}
      portrait={portrait}
      visible={visible}
    >

    </PromptPanel>
  )
}