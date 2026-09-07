import Vide, { type Derivable, read } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { School } from "shared/structs/school";
import { Images } from "../utility/images";


interface SchoolRoundIconProps {
  readonly school: Derivable<School>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim>;
  readonly layoutOrder?: Derivable<number>;
}

export function SchoolRoundIcon({ anchorPoint, position, school, size, layoutOrder }: SchoolRoundIconProps): Vide.Node {
  const getSize = () => read(size) ?? new UDim(1);
  const iconAsset = () => {
    const schoolName = School[read(school)] as keyof typeof School;
    return Images[`Icon_${schoolName}`];
  };

  return (
    <imagelabel Name={$nameof(SchoolRoundIcon)}
      BackgroundTransparency={1}
      Image={iconAsset}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={() => new UDim2(getSize().Scale, getSize().Offset, getSize().Scale, getSize().Offset)}
      LayoutOrder={read(layoutOrder) ?? 1}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  );
}