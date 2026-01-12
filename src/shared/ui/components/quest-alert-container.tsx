import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

interface QuestAlertContainerProps {
  readonly adornee: Derivable<BasePart>;
  readonly offset?: Derivable<Vector3>;
}

export const CONTAINER_SIZE = new Vector2(75, 75);

export function QuestAlertContainer({ adornee, offset, children }: PropsWithChildren<QuestAlertContainerProps>): Vide.Node {
  return (
    <billboardgui Name="QuestAlertContainer"
      Active={true}
      Adornee={adornee}
      ClipsDescendants={true}
      LightInfluence={0}
      MaxDistance={80}
      SizeOffset={new Vector2(0, 0.5)}
      Size={new UDim2(0.1, CONTAINER_SIZE.X, 0.1, CONTAINER_SIZE.Y)}
      StudsOffsetWorldSpace={offset ?? new Vector3(0, 7, 0)}
      ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
    >
      {children}
    </billboardgui>
  );
}