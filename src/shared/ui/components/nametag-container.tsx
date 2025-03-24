import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

interface NametagContainerProps {
  readonly adornee: Derivable<BasePart>;
  readonly offset?: Derivable<Vector3>;
}

export function NametagContainer({ adornee, offset, children }: PropsWithChildren<NametagContainerProps>): Vide.Node {
  return (
    <billboardgui
      Name="NametagContainer"
      Active={true}
      Adornee={adornee}
      ClipsDescendants={true}
      LightInfluence={0}
      MaxDistance={80}
      SizeOffset={new Vector2(0, 0.5)}
      Size={new UDim2(0.1, 240, 0.1, 40)}
      StudsOffsetWorldSpace={offset ?? new Vector3(0, 3.5, 0)}
      ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
    >
      {children}
    </billboardgui>
  );
}