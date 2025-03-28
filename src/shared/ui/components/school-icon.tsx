import Vide, { type Derivable, read } from "@rbxts/vide";
import { $nameof } from "rbxts-transform-debug";

import { School } from "shared/structs/school";

import { LargeSpritesheetIcon } from "./large-spritsheet-icon";

interface SchoolIconProps {
  readonly school: Derivable<School>;
  readonly anchorPoint?: Derivable<Vector2>;
  readonly position?: Derivable<UDim2>;
  readonly size?: Derivable<UDim>;
  readonly layoutOrder?: Derivable<number>;
}

const offsets: Record<School, Vector2> = {
  [School.Fire]: new Vector2(7, 1),
  [School.Ice]: new Vector2(8, 1),
  [School.Storm]: new Vector2(2, 2),
  [School.Life]: new Vector2(0, 2),
  [School.Death]: new Vector2(6, 1),
  [School.Myth]: new Vector2(1, 2),
  [School.Balance]: new Vector2(5, 1),
  [School.Solar]: new Vector2(4, 6),
  [School.Lunar]: new Vector2(3, 6),
  [School.Stellar]: new Vector2(2, 6),
  [School.Shadow]: new Vector2(2, 8)
};

export function SchoolIcon({ anchorPoint, position, school, size, layoutOrder }: SchoolIconProps): Vide.Node {
  const getSize = () => read(size) ?? new UDim(1);

  return (
    <LargeSpritesheetIcon name={$nameof(SchoolIcon)}
      anchorPoint={anchorPoint}
      position={position}
      size={() => new UDim2(getSize().Scale, getSize().Offset, getSize().Scale, getSize().Offset)}
      offset={offsets[read(school)]}
      layoutOrder={layoutOrder}
    />
  );
}