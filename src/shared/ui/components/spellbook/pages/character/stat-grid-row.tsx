import Vide, { type Derivable, read } from "@rbxts/vide";

import { anchorPoints } from "shared/ui/utility/positioning";
import { School, type PlayableSchool } from "shared/structs/school";
import type { PerSchoolStats } from "shared/structs/data/character-stats";

import { SchoolIcon } from "../../../school-icon";
import { WizText } from "../../../wiz-text";

const PLAYABLE_SCHOOLS: PlayableSchool[] = [
  School.Fire, School.Ice, School.Storm, School.Life, School.Death, School.Myth, School.Balance
];

interface StatGridRowProps {
  /** Fraction of the page's height the row of slots is vertically centered on. */
  readonly y: Derivable<number>;
  /** Fraction of the page's width each slot is horizontally centered on, keyed by school. */
  readonly slotX: Readonly<Record<PlayableSchool, number>>;
  readonly values: Derivable<PerSchoolStats<number>>;
  readonly suffix?: Derivable<string>;
}

export function StatGridRow({ y, slotX, values, suffix = "" }: StatGridRowProps): Vide.Node {
  return (
    <frame Name="StatGridRow" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
      {PLAYABLE_SCHOOLS.map(school => {
        const x = slotX[school];
        return <>
          <SchoolIcon school={school}
            anchorPoint={anchorPoints.center}
            position={() => new UDim2(x, 0, read(y) - 0.03, 0)}
            size={new UDim(0.085)}
          />
          <WizText
            anchorPoint={anchorPoints.center}
            position={() => new UDim2(x, 0, read(y) + 0.028, 0)}
            size={UDim2.fromOffset(60, 20)}
            textSize={13}
            text={() => `${read(values)[school]}${read(suffix)}`}
          />
        </>;
      })}
    </frame>
  );
}
