import Vide, { PropsWithChildren } from "@rbxts/vide";

import { Container } from "shared/ui/utility/components/container";
import { anchorPoints, positions } from "shared/ui/utility/positioning";

/**
 * Where the two-page spread sits inside `Images.Background_BookPages` (a 512x512 texture), measured by
 * sampling the source image's pixels for the page/binding color boundary - the parchment's torn edge is
 * irregular, so these are medians across many rows/columns, not a single hard edge.
 */
const PAGE_AREA_SIZE = UDim2.fromScale(0.9325, 1);
const PAGE_AREA_CENTER_OFFSET = UDim2.fromScale(-0.0332, 0);

/** Fraction of the two-page spread's width where the spine crease falls - same pixel-sampling method as `PAGE_AREA_SIZE`. */
export const BOOK_SPINE_X = 0.522;

export function BookPageContainer({ children }: PropsWithChildren): Vide.Node {
  return (
    <Container
      anchorPoint={anchorPoints.center}
      position={positions.center.add(PAGE_AREA_CENTER_OFFSET)}
      size={PAGE_AREA_SIZE}
      zIndex={4}
    >
      {children}
    </Container>
  );
}