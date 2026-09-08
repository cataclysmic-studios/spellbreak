import Vide, { source, Show, type Source } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { anchorPoints, positions } from "shared/ui/utility/positioning";
import { palette } from "shared/ui/palette";
import { Images } from "shared/ui/utility/images";
import { getLevelTitle, getMaxGold, getRequiredXpForNextLevel, getSchoolTitle } from "shared/utility/character";
import { commaFormat } from "shared/utility/format";
import { School, type PlayableSchool } from "shared/structs/school";
import type { CharacterData, PlayerData } from "shared/structs/data";

import { WizText } from "../../wiz-text";
import { BookPageContainer, BOOK_SPINE_X } from "./book-page-container";
import { StatGridRow } from "./character/stat-grid-row";
import { SingleStat } from "./character/single-stat";
import { CharacterPortrait } from "./character/character-portrait";
import { ParchmentBanner } from "../../parchment-banner";
import { SchoolRoundIcon } from "../../school-round-icon";
import { SpritestripButton } from "../../spritestrip-button";
import { Container } from "shared/ui/utility/components/container";
import type { PageProps } from "..";

const enum StatsTab {
  Basic,
  Advanced,
  Crafting,
  Badges,
  PvP,
  Timers
}

/** Fraction of the page width each school's grid slot is centered on - baked into `Background_Character_Right_Stats`. */
const BASIC_SLOT_X: Readonly<Record<PlayableSchool, number>> = {
  [School.Fire]: 0.2135,
  [School.Ice]: 0.325,
  [School.Storm]: 0.4414,
  [School.Life]: 0.5508,
  [School.Death]: 0.6641,
  [School.Myth]: 0.7773,
  [School.Balance]: 0.8906
};

/** Fraction of the page width each school's grid slot is centered on - baked into `Background_Character_Right_Stats_Advanced*`. */
const ADVANCED_SLOT_X: Readonly<Record<PlayableSchool, number>> = {
  [School.Fire]: 0.2383,
  [School.Ice]: 0.3398,
  [School.Storm]: 0.4453,
  [School.Life]: 0.5508,
  [School.Death]: 0.6563,
  [School.Myth]: 0.7617,
  [School.Balance]: 0.8672
};

interface StatsTabConfig {
  readonly tab: StatsTab;
  readonly image: string;
}

/** The tab row poking above the right page - one source of truth per tab, shared by its button and its `TabScroll` backdrop. */
const STATS_TABS: readonly StatsTabConfig[] = [
  { tab: StatsTab.Basic, image: Images.Button_Character_Stats },
  { tab: StatsTab.Advanced, image: Images.Button_Character_Stats_Advanced },
  { tab: StatsTab.Crafting, image: Images.Button_Character_Craft },
  { tab: StatsTab.Badges, image: Images.Button_Character_Badges },
  { tab: StatsTab.PvP, image: Images.Button_Character_PvP },
  { tab: StatsTab.Timers, image: Images.Button_Tab_Timer }
];

interface LeftPageField {
  readonly position: UDim2;
  readonly size: UDim2;
  readonly comicSans?: boolean;
  readonly textSize: number;
  readonly textColor?: Color3;
  readonly alignX?: Enum.TextXAlignment | Enum.TextXAlignment["Name"];
  readonly text: (character: CharacterData, player: PlayerData) => string;
}

/** Every readout overlaid onto `Background_Character_Left` - positions/sizes are fractions of that page, baked to match its art. Tune freely. */
const LEFT_PAGE_FIELDS: readonly LeftPageField[] = [
  {
    position: UDim2.fromScale(0.58, 0.123), size: UDim2.fromScale(0.5, 0.06),
    textSize: 18, textColor: palette.yellow,
    alignX: "Left",
    text: character => `${getLevelTitle(character.level)} (Level ${character.level})`
  },
  {
    position: UDim2.fromScale(0.63, 0.2), size: UDim2.fromScale(0.5, 0.06),
    textSize: 18, textColor: palette.yellow,
    alignX: "Left",
    text: character => getSchoolTitle(character.school)
  },
  {
    position: UDim2.fromScale(0.43, 0.282), size: UDim2.fromOffset(90, 20),
    textSize: 18, textColor: palette.black,
    text: () => "Health"
  },
  {
    position: UDim2.fromScale(0.385, 0.35), size: UDim2.fromOffset(90, 20),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => `${commaFormat(character.stats.health)}/${commaFormat(character.stats.maxHealth)}`
  },
  {
    position: UDim2.fromScale(0.8, 0.282), size: UDim2.fromOffset(90, 20),
    textSize: 18, textColor: palette.black,
    text: () => "Mana"
  },
  {
    position: UDim2.fromScale(0.76, 0.35), size: UDim2.fromOffset(90, 20),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => `${commaFormat(character.stats.mana)}/${commaFormat(character.stats.maxMana)}`
  },
  {
    position: UDim2.fromScale(0.55, 0.423), size: UDim2.fromOffset(160, 20),
    textSize: 14, textColor: palette.black,
    text: () => "Experience"
  },
  {
    position: UDim2.fromScale(0.57, 0.49), size: UDim2.fromOffset(90, 20),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => `${commaFormat(character.xp)}/${commaFormat(getRequiredXpForNextLevel(character.level))}`
  },
  {
    position: UDim2.fromScale(0.43, 0.573), size: UDim2.fromOffset(90, 30),
    textSize: 14, textColor: palette.black,
    text: () => "Training Points"
  },
  {
    position: UDim2.fromScale(0.39, 0.633), size: UDim2.fromOffset(90, 20),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => tostring(character.trainingPoints)
  },
  {
    position: UDim2.fromScale(0.81, 0.565), size: UDim2.fromOffset(90, 20),
    textSize: 18, textColor: palette.black,
    text: () => "Gold"
  },
  {
    position: UDim2.fromScale(0.77, 0.625), size: UDim2.fromOffset(110, 50),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => `${commaFormat(character.gold)}\n/${commaFormat(getMaxGold(character.level))}`
  },
  {
    position: UDim2.fromScale(0.43, 0.702), size: UDim2.fromOffset(90, 20),
    textSize: 18, textColor: palette.black,
    text: () => "Crowns"
  },
  {
    position: UDim2.fromScale(0.39, 0.768), size: UDim2.fromOffset(90, 30),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: (_, player) => commaFormat(player.crowns)
  },
  {
    position: UDim2.fromScale(0.818, 0.712), size: UDim2.fromOffset(90, 30),
    textSize: 14, textColor: palette.black,
    text: () => "Blue Arena Tickets"
  },
  {
    position: UDim2.fromScale(0.77, 0.772), size: UDim2.fromOffset(90, 30),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => commaFormat(character.arenaTickets)
  },
  {
    position: UDim2.fromScale(0.52, 0.846), size: UDim2.fromOffset(160, 20),
    textSize: 14, textColor: palette.black,
    text: () => "Energy"
  },
  {
    position: UDim2.fromScale(0.47, 0.92), size: UDim2.fromOffset(90, 30),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: character => `${commaFormat(character.stats.energy)}/${commaFormat(character.stats.maxEnergy)}`
  },
  {
    position: UDim2.fromScale(0.82, 0.846), size: UDim2.fromOffset(120, 20),
    textSize: 14, textColor: palette.black,
    text: () => "More in"
  },
  {
    position: UDim2.fromScale(0.83, 0.92), size: UDim2.fromOffset(90, 30),
    textSize: 22, textColor: palette.black, comicSans: true,
    text: () => "0:00"
  },
];

interface CharacterPageProps extends PageProps {
  readonly player: Source<PlayerData>;
}

export function CharacterPage({ player, character }: CharacterPageProps): Vide.Node {
  const px = usePx();
  const stats = () => character().stats;
  const tab = source(StatsTab.Basic);
  const advancedPage = source<0 | 1>(0);

  return (
    <BookPageContainer>
      <ParchmentBanner name="NameBanner"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter}
        size={UDim2.fromOffset(px(480), px(52))}
        stroke={false}
        textSize={px(24)}
        textColor={palette.black}
        text={() => character().name}
        zIndex={5}
      />
      {/* left page */}
      <imagelabel Name="LeftPage"
        BackgroundTransparency={1}
        AnchorPoint={anchorPoints.topLeft}
        Position={UDim2.fromScale(0, 0)}
        Size={UDim2.fromScale(BOOK_SPINE_X, 1)}
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
        <SchoolRoundIcon
          school={() => character().school}
          anchorPoint={anchorPoints.leftCenter}
          position={UDim2.fromScale(0.23, 0.2)}
          size={new UDim(0.14)}
        />

        {LEFT_PAGE_FIELDS.map(field => (
          <WizText
            anchorPoint={anchorPoints.center}
            position={field.position}
            size={field.size}
            alignX={field.alignX}
            textWrap
            textSize={px(field.textSize)}
            textColor={field.textColor}
            lineHeight={field.comicSans ? 0.7 : 1}
            font={field.comicSans ? Enum.Font.Cartoon : Enum.Font.LuckiestGuy}
            text={() => field.text(character(), player())}
          />
        ))}
      </imagelabel>

      {/* right page */}
      <frame Name="RightPage"
        BackgroundTransparency={1}
        AnchorPoint={anchorPoints.topLeft}
        Position={UDim2.fromScale(0.522, 0)}
        Size={UDim2.fromScale(0.963 - BOOK_SPINE_X, 1)}
      >
        <Container name="ButtonContainer"
          anchorPoint={anchorPoints.leftCenter}
          position={UDim2.fromScale(0, 0.12)}
          size={UDim2.fromScale(0.95, 0.12)}
          zIndex={5}
        >
          <uilistlayout
            HorizontalAlignment="Left"
            VerticalAlignment="Center"
            FillDirection="Horizontal"
            Padding={new UDim(-0.04, 0)}
          />
          {STATS_TABS.map(cfg => <>
            <imagelabel Name="TabScroll"
              BackgroundTransparency={1}
              AnchorPoint={anchorPoints.bottomCenter}
              Size={UDim2.fromScale(0.2, 1)}
              Image={Images.TabScroll}
              ImageTransparency={() => tab() === cfg.tab ? 0 : 1}
            >
              <SpritestripButton name="TabButton"
                spritestripImage={cfg.image}
                tileSize={64}
                offset={Vector2.zero}
                hoveredOffset={new Vector2(1, 0)}
                anchorPoint={anchorPoints.center}
                position={positions.center.sub(UDim2.fromScale(0, 0.05))}
                size={UDim2.fromScale(0.75, 0.75)}
                activated={() => tab(cfg.tab)}
              >
                <uiaspectratioconstraint />
              </SpritestripButton>
            </imagelabel>
          </>)}

        </Container>

        <Show when={() => tab() === StatsTab.Basic}>
          {() => (
            <imagelabel Name="BasicStats" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)} Image={Images.Background_Character_Right_Stats}>
              <StatGridRow y={0.34} slotX={BASIC_SLOT_X} values={() => stats().damage} suffix="%" />
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
          {() => <Container zIndex={5} name="AdvancedPageButtons">
            <WizText
              anchorPoint={anchorPoints.bottomCenter}
              position={UDim2.fromScale(0.5, 0.98)}
              size={UDim2.fromScale(0.4, 0.095)}
              textSize={px(28)}
              textColor={palette.black}
              text={() => `${advancedPage() + 1}/2`}
            />
            <SpritestripButton name="PrevPageButton"
              tileSize={64}
              offset={Vector2.zero}
              hoveredOffset={new Vector2(1, 0)}
              pressedOffset={new Vector2(2, 0)}
              inactiveOffset={new Vector2(3, 0)}
              anchorPoint={anchorPoints.bottomCenter}
              position={UDim2.fromScale(0.15, 0.98)}
              size={UDim2.fromScale(0.15, 0.15)}
              spritestripImage={Images.Button_Arrow01}
              active={() => advancedPage() === 1}
              activated={() => advancedPage(0)}
            >
              <uiaspectratioconstraint />
            </SpritestripButton>
            <SpritestripButton name="NextPageButton"
              tileSize={64}
              offset={new Vector2(0, 1)}
              hoveredOffset={new Vector2(1, 1)}
              pressedOffset={new Vector2(2, 1)}
              inactiveOffset={new Vector2(3, 1)}
              anchorPoint={anchorPoints.bottomCenter}
              position={UDim2.fromScale(0.85, 0.98)}
              size={UDim2.fromScale(0.15, 0.15)}
              spritestripImage={Images.Button_Arrow01}
              active={() => advancedPage() === 0}
              activated={() => advancedPage(1)}
            >
              <uiaspectratioconstraint />
            </SpritestripButton>
          </Container>}
        </Show>
      </frame>
    </BookPageContainer>
  );
}
