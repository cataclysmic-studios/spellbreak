import Vide, { type Derivable } from "@rbxts/vide";

import { Palette } from "../palette";

interface GoldStrokeProps {
  readonly thickness: Derivable<number>;
  readonly transparency: Derivable<number>;
}

export function GoldStroke({ thickness, transparency }: GoldStrokeProps): Vide.Node {
  return (
    <uistroke
      Color={Palette.white}
      Thickness={thickness}
      Transparency={transparency}
      LineJoinMode={Enum.LineJoinMode.Miter}
      ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
    >
      <uigradient
        Rotation={90}
        Color={new ColorSequence([
          new ColorSequenceKeypoint(0, Palette.gold),
          new ColorSequenceKeypoint(1, Palette.richGold)
        ])}
      />
    </uistroke>
  )
}