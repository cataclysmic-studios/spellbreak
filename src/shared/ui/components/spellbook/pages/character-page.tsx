import Vide, { source, Show } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { anchorPoints } from "shared/ui/utility/positioning";
import { palette } from "shared/ui/palette";
import { Images } from "shared/ui/utility/images";
import { getRequiredXpForNextLevel } from "shared/utility/character";

import { WizText } from "../../wiz-text";
import { BookPageContainer } from "./book-page-container";
import { StatGridRow } from "./character/stat-grid-row";
import { SingleStat } from "./character/single-stat";
import { CharacterPortrait } from "./character/character-portrait";

import type { PageProps } from "..";

const enum StatsTab {
  Basic,
  Advanced
}

/** Fraction of the page width each of the 7 grid slots is centered on, left to right - baked into `Background_Character_Right_Stats*`. */
const BASIC_SLOT_X = [0.2129, 0.3242, 0.4414, 0.5508, 0.6641, 0.7773, 0.8906];
const ADVANCED_SLOT_X = [0.2383, 0.3398, 0.4453, 0.5508, 0.6563, 0.7617, 0.8672];

export function CharacterPage({ character }: PageProps): Vide.Node {
  const px = usePx();
  const stats = () => character().stats;
  const tab = source(StatsTab.Basic);
  const advancedPage = source<0 | 1>(0);

  return (
    <BookPageContainer>
      {/* left page */}
      <imagelabel Name="LeftPage"
        BackgroundTransparency={1}
        Size={UDim2.fromScale(0.5, 1)}
        Image={Images.Background_Character_Left}
      >
        <frame Name="PortraitFrame"
          BackgroundTransparency={1}
          ClipsDescendants
          AnchorPoint={anchorPoints.center}
          Position={UDim2.fromScale(0.17, 0.145)}
          Size={UDim2.fromScale(0.3, 0.3)}
        >
          <uiaspectratioconstraint AspectRatio={1} DominantAxis={Enum.DominantAxis.Width} />
          <uicorner CornerRadius={new UDim(1, 0)} />
          <CharacterPortrait />
        </frame>
        <WizText
          anchorPoint={anchorPoints.center}
          position={UDim2.fromScale(0.68, 0.095)}
          size={UDim2.fromScale(0.5, 0.06)}
          textSize={px(16)}
          textColor={palette.lightYellow}
          text={() => character().name}
        />
        <WizText
          anchorPoint={anchorPoints.center}
          position={UDim2.fromScale(0.68, 0.165)}
          size={UDim2.fromScale(0.5, 0.06)}
          textSize={px(14)}
          textColor={palette.lightYellow}
          text={() => `Level ${character().level}`}
        />

        {/* Health / Mana */}
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.32, 0.28)} size={UDim2.fromOffset(px(90), px(20))} textSize={px(13)}
          text={() => `${stats().health}/${stats().maxHealth}`} />
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.78, 0.28)} size={UDim2.fromOffset(px(90), px(20))} textSize={px(13)}
          text={() => `${stats().mana}/${stats().maxMana}`} />

        {/* Experience */}
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.55, 0.408)} size={UDim2.fromOffset(px(160), px(20))} textSize={px(13)}
          text={() => `${character().xp}/${getRequiredXpForNextLevel(character().level)}`} />

        {/* Training Points / Gold */}
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.32, 0.549)} size={UDim2.fromOffset(px(90), px(20))} textSize={px(13)}
          text={() => `${character().trainingPoints}`} />
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.78, 0.549)} size={UDim2.fromOffset(px(90), px(20))} textSize={px(13)}
          text={() => `${character().gold}`} />

        {/* Energy */}
        <WizText anchorPoint={anchorPoints.center} position={UDim2.fromScale(0.55, 0.838)} size={UDim2.fromOffset(px(160), px(20))} textSize={px(13)}
          text={() => `${stats().energy}/${stats().maxEnergy}`} />
      </imagelabel>

      {/* right page */}
      <frame Name="RightPage" BackgroundTransparency={1} AnchorPoint={anchorPoints.topRight} Position={UDim2.fromScale(1, 0)} Size={UDim2.fromScale(0.5, 1)}>
        <imagebutton Name="StatsTabButton"
          BackgroundTransparency={1}
          AnchorPoint={anchorPoints.bottomCenter}
          Position={UDim2.fromScale(0.4, -0.01)}
          Size={UDim2.fromScale(0.13, 0.13)}
          Image={Images.Button_Character_Stats}
          ImageTransparency={() => tab() === StatsTab.Basic ? 0 : 0.4}
          Activated={() => tab(StatsTab.Basic)}
        />
        <imagebutton Name="AdvancedStatsTabButton"
          BackgroundTransparency={1}
          AnchorPoint={anchorPoints.bottomCenter}
          Position={UDim2.fromScale(0.6, -0.01)}
          Size={UDim2.fromScale(0.13, 0.13)}
          Image={Images.Button_Character_Stats_Advanced}
          ImageTransparency={() => tab() === StatsTab.Advanced ? 0 : 0.4}
          Activated={() => tab(StatsTab.Advanced)}
        />

        <Show when={() => tab() === StatsTab.Basic}>
          {() => (
            <imagelabel Name="BasicStats" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)} Image={Images.Background_Character_Right_Stats}>
              <StatGridRow y={0.3125} slotX={BASIC_SLOT_X} values={() => stats().damage} suffix="%" />
              <StatGridRow y={0.585} slotX={BASIC_SLOT_X} values={() => stats().resist} suffix="%" />
              <StatGridRow y={0.8721} slotX={BASIC_SLOT_X} values={() => stats().accuracy} suffix="%" />
            </imagelabel>
          )}
        </Show>

        <Show when={() => tab() === StatsTab.Advanced}>
          {() => (
            <imagelabel Name="AdvancedStats" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}
              Image={() => advancedPage() === 0 ? Images.Background_Character_Right_Stats_Advanced : Images.Background_Character_Right_Stats_Advanced02}
            >
              <Show when={() => advancedPage() === 0}>
                {() => <>
                  <StatGridRow y={0.3379} slotX={ADVANCED_SLOT_X} values={() => stats().criticalRating} />
                  <StatGridRow y={0.5059} slotX={ADVANCED_SLOT_X} values={() => stats().criticalBlockRating} />
                  <StatGridRow y={0.6748} slotX={ADVANCED_SLOT_X} values={() => stats().pierce} />
                  <SingleStat x={0.176} y={0.771} value={() => `${stats().stunResistance}%`} />
                  <SingleStat x={0.605} y={0.771} value={() => `${stats().incomingHealing}%/${stats().outgoingHealing}%`} />
                </>}
              </Show>
              <Show when={() => advancedPage() === 1}>
                {() => <>
                  <SingleStat x={0.176} y={0.479} value={() => `${stats().powerPipChance * 100}%`} />
                  <SingleStat x={0.605} y={0.479} value={() => `${stats().shadowPipRating}`} />
                </>}
              </Show>
            </imagelabel>
          )}
        </Show>

        <Show when={() => tab() === StatsTab.Advanced}>
          {() => <>
            <imagebutton Name="PrevPageButton"
              BackgroundTransparency={1}
              AnchorPoint={anchorPoints.center}
              Position={UDim2.fromScale(0.4, 0.98)}
              Size={UDim2.fromScale(0.12, 0.06)}
              Image={Images.Button_Arrow01}
              Visible={() => advancedPage() === 1}
              Activated={() => advancedPage(0)}
            />
            <imagebutton Name="NextPageButton"
              BackgroundTransparency={1}
              AnchorPoint={anchorPoints.center}
              Position={UDim2.fromScale(0.6, 0.98)}
              Size={UDim2.fromScale(0.12, 0.06)}
              Image={Images.Button_Arrow03}
              Visible={() => advancedPage() === 0}
              Activated={() => advancedPage(1)}
            />
          </>}
        </Show>
      </frame>
    </BookPageContainer>
  );
}
