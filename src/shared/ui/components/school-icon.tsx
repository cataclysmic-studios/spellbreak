import Vide, { type Derivable, read } from "@rbxts/vide";

import { School } from "shared/structs/school";
import { Images } from "../utility/images";

interface SchoolIconProps {
  readonly school: Derivable<School>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim2>;
  readonly layoutOrder?: Derivable<number>;
}

const offsets: Record<School, Vector2> = {
  [School.Fire]: new Vector2(364, 52),
  [School.Ice]: new Vector2(416, 52),
  [School.Storm]: new Vector2(104, 104),
  [School.Life]: new Vector2(0, 104),
  [School.Death]: new Vector2(312, 52),
  [School.Myth]: new Vector2(52, 104),
  [School.Balance]: new Vector2(260, 52),
  [School.Solar]: new Vector2(208, 312),
  [School.Lunar]: new Vector2(156, 312),
  [School.Stellar]: new Vector2(104, 312),
  [School.Shadow]: new Vector2(104, 416)
};

export function SchoolIcon({ anchorPoint, position, school, size, layoutOrder }: SchoolIconProps) {
  return (
    <imagelabel
      Name="SchoolIcon"
      BackgroundTransparency={1}
      AnchorPoint={anchorPoint}
      Position={position}
      Size={size ?? UDim2.fromScale(1, 1)}
      Image={Images.LargeSchoolIconsSpritesheet}
      ImageRectSize={new Vector2(52, 52)}
      ImageRectOffset={offsets[read(school)]}
      LayoutOrder={layoutOrder}
    >
      <uiaspectratioconstraint />
    </imagelabel>
  );
}