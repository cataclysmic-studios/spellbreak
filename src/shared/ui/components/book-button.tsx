import Vide, { type Source, source, spring } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";
import { AnchorPoints, Positions } from "../utility/positioning";
import { Images } from "../utility/images";
import { SpritestripButton } from "./spritestrip-button";

interface BookButtonProps {
  readonly isOpen: Source<boolean>;
}

const buttonSize = 128;
export function BookButton({ isOpen }: BookButtonProps): Vide.Node {
  const hovered = source(false);
  const springOffset = spring(() => hovered() ? 10 : 0, 0.1, 1);
  const px = usePx();

  return (
    <SpritestripButton name="Spellbook"
      anchorPoint={AnchorPoints.center}
      position={Positions.bottomRight.sub(UDim2.fromOffset(buttonSize / 2, buttonSize / 2))}
      size={() => UDim2.fromOffset(px(buttonSize + springOffset()), px(buttonSize + springOffset()))}
      spritestripImage={Images.SpellbookButton}
      tileSize={buttonSize}

      hovered={() => hovered(true)}
      unhovered={() => hovered(false)}
      activated={() => isOpen(!isOpen())}
    />
  );
}