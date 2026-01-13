import Vide, { type Source, source, spring } from "@rbxts/vide";

import { usePx } from "../../hooks/use-px";
import { anchorPoints, positions } from "../../utility/positioning";
import { Images } from "../../utility/images";
import { SpritestripButton } from "../spritestrip-button";

interface BookButtonProps {
  readonly isOpen: Source<boolean>;
  readonly visible: Source<boolean>;
}

const buttonSize = 128;
export function BookButton({ isOpen, visible }: BookButtonProps): Vide.Node {
  const hovered = source(false);
  const springOffset = spring(() => hovered() ? 12 : 0, 0.15, 1);
  const px = usePx();

  return (
    <SpritestripButton name="Spellbook"
      anchorPoint={anchorPoints.center}
      position={positions.bottomRight.sub(UDim2.fromOffset(buttonSize / 2, buttonSize / 2))}
      size={() => UDim2.fromOffset(px(buttonSize + springOffset()), px(buttonSize + springOffset()))}
      spritestripImage={Images.SpellbookButton}
      tileSize={buttonSize}
      visible={visible}
      active={visible}

      hovered={() => hovered(true)}
      unhovered={() => hovered(false)}
      activated={() => isOpen(!isOpen())}
    />
  );
}