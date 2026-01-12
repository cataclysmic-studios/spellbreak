import Vide, { type Derivable } from "@rbxts/vide";

import { palette } from "../palette";

interface GoldStrokeProps {
  readonly thickness: Derivable<number>;
  readonly transparency: Derivable<number>;
}

export function GoldStroke({ thickness, transparency }: GoldStrokeProps): Vide.Node {
  return (
    <uistroke
      Color={palette.white}
      Thickness={thickness}
      Transparency={transparency}
      LineJoinMode={Enum.LineJoinMode.Miter}
      ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
    >
      <uigradient
        Rotation={90}
        Color={new ColorSequence([
          new ColorSequenceKeypoint(0, palette.gold),
          new ColorSequenceKeypoint(1, palette.richGold)
        ])}
      />
    </uistroke>
  )
}