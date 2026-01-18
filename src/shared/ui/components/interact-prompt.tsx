import Vide, { Derivable, For, read, Show, type Source } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { anchorPoints, positions } from "../utility/positioning";
import { getNpcByID } from "shared/utility/npc";
import type { Interactable } from "shared/structs/interactable";

import { PromptPanel } from "./prompt-panel";
import { Container } from "../utility/components/container";
import { WizText } from "./wiz-text";
import { palette } from "../palette";
import { Images } from "../utility/images";

interface InteractPromptProps {
  readonly interactable: Source<Maybe<Interactable>>;
  readonly inputs?: Derivable<string[]>;
  readonly action?: Derivable<string>;
  readonly visible: Source<boolean>;
}

export function InteractPrompt({ interactable, inputs = [Images.Input_X], action = "Talk", visible }: InteractPromptProps): Vide.Node {
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

  const size = px(500);
  const textSize = px(28);
  return (
    <PromptPanel name="InteractPrompt"
      anchorPoint={anchorPoints.bottomCenter}
      position={positions.bottomCenter.sub(UDim2.fromOffset(0, px(48)))}
      size={UDim2.fromOffset(size, size)}
      title={title}
      portrait={portrait}
      visible={visible}
    >
      <Container name="TextContainer"
        anchorPoint={anchorPoints.rightCenter}
        position={positions.rightCenter.sub(UDim2.fromScale(0.06, -0.02))}
        size={UDim2.fromScale(0.65, 0.6)}
      >
        <uilistlayout
          FillDirection="Horizontal"
          HorizontalAlignment="Left"
          VerticalAlignment="Center"
          Padding={new UDim(0.05, 0)}
        />
        <WizText
          font={Enum.Font.Cartoon}
          alignX={Enum.TextXAlignment.Center}
          textColor={palette.black}
          textSize={textSize}
          text="Press"
          size={UDim2.fromScale(0.14, 1)}
        />
        <For each={() => read(inputs)}>
          {(inputImage, index) => <>
            <imagelabel Name="InputImage"
              BackgroundTransparency={1}
              Image={inputImage}
              Size={UDim2.fromScale(0.45, 0.45)}
            >
              <uiaspectratioconstraint />
            </imagelabel>
            {
              index() < read(inputs).size()
                ? <WizText
                  font={Enum.Font.Cartoon}
                  alignX={Enum.TextXAlignment.Center}
                  textColor={palette.black}
                  textSize={textSize}
                  text="or"
                  size={UDim2.fromScale(0.04, 1)}
                />
                : undefined
            }
          </>}
        </For>
        <WizText
          font={Enum.Font.Cartoon}
          alignX={Enum.TextXAlignment.Center}
          textColor={palette.black}
          textSize={textSize}
          text={() => `to ${read(action)}`}
          size={UDim2.fromScale(0.18, 1)}
        />
      </Container>
    </PromptPanel>
  )
}