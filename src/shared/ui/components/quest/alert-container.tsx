import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

interface QuestAlertContainerProps {
  readonly adornee: Derivable<BasePart>;
  readonly offset?: Derivable<Vector3>;
}

const CONTAINER_SIZE = 70;
const DEFAULT_OFFSET = new Vector3(0, 4.5, 0);

export function QuestAlertContainer({ adornee, offset = DEFAULT_OFFSET, children }: PropsWithChildren<QuestAlertContainerProps>): Vide.Node {
  return (
    <billboardgui Name="QuestAlertContainer"
      Active
      ClipsDescendants
      Adornee={adornee}
      LightInfluence={0}
      MaxDistance={80}
      SizeOffset={new Vector2(0, 1)}
      Size={new UDim2(0.1, CONTAINER_SIZE, 0.1, CONTAINER_SIZE)}
      StudsOffsetWorldSpace={offset}
      ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
    >
      {children}
    </billboardgui>
  );
}