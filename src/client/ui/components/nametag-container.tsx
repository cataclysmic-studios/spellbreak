import Vide, { type Derivable, type PropsWithChildren } from "@rbxts/vide";

import { usePx } from "../hooks/use-px";

interface NametagContainerProps {
  readonly adornee: Derivable<PVInstance | Attachment>;
  readonly offset?: Derivable<Vector3>;
}

export function NametagContainer({ adornee, offset, children }: PropsWithChildren<NametagContainerProps>) {
  const px = usePx();

  return (
    <billboardgui
      Name="NametagContainer"
      Active={true}
      Adornee={adornee}
      ClipsDescendants={true}
      Size={UDim2.fromOffset(px(240), px(40))}
      StudsOffsetWorldSpace={offset ?? new Vector3(0, 3.5, 0)}
      ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
    >
      {children}
    </billboardgui>
  );
}