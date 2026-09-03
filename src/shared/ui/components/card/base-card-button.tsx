import Vide, { Derivable, read, source } from "@rbxts/vide";

import { usePx } from "shared/ui/hooks/use-px";
import { palette } from "../../palette";
import { Images } from "../../utility/images";
import { anchorPoints, positions } from "../../utility/positioning";
import { cardReferenceWidth, cardReferenceHeight } from "shared/constants";
import { School } from "shared/structs/school";
import { SpellCardKind, type SpellCard } from "shared/structs/spell/card";

import { WizText } from "../wiz-text";
import { SchoolIcon } from "../school-icon";
import { SpritesheetIcon } from "../spritesheet-icon";
import { CardBackground } from "./card-background";
import { CardDescription } from "./card-description";
import { SpellKindIcon } from "./spell-kind-icon";

interface BaseCardButtonProps {
  readonly spellCard: SpellCard;
  readonly layoutOrder: Derivable<number>;
  readonly grayscale: Derivable<boolean>;
  readonly selected?: Derivable<boolean>;
  readonly hovered?: () => void;
  readonly unhovered?: () => void;
  readonly leftClicked?: () => void;
  readonly rightClicked?: () => void;
}

const SPELL_ART_SIZE = 64;
const CARD_ART_SPRITESHEETS: { colored: string; grayscale: string; }[] = [
  {
    colored: "rbxassetid://89063483535157",
    grayscale: "rbxassetid://131276102206825"
  }, {
    colored: "rbxassetid://72199822054271",
    grayscale: "rbxassetid://119954144892949"
  }, {
    colored: "rbxassetid://91690438885961",
    grayscale: "rbxassetid://98063103618595"
  }, {
    colored: "rbxassetid://94488975783253",
    grayscale: "rbxassetid://85031341614899"
  }, {
    colored: "rbxassetid://102232008786766",
    grayscale: "rbxassetid://75341543912308"
  }, {
    colored: "rbxassetid://78641261208589",
    grayscale: "rbxassetid://103461797304495"
  }
];

const GRAYSCALE_CARD_IMAGES: Record<SpellCardKind, string> = {
  [SpellCardKind.Normal]: Images.SchoolCardBW,
  [SpellCardKind.Treasure]: Images.TreasureCardBW,
  [SpellCardKind.Item]: Images.ItemCardBW
}

const SCHOOL_CARD_IMAGES: Record<School, string> = {
  [School.Fire]: Images.FireCard,
  [School.Ice]: Images.IceCard,
  [School.Storm]: Images.StormCard,
  [School.Life]: Images.LifeCard,
  [School.Death]: Images.DeathCard,
  [School.Myth]: Images.MythCard,
  [School.Balance]: Images.BalanceCard,
  [School.Stellar]: Images.StellarCard,
  [School.Lunar]: Images.LunarCard,
  [School.Solar]: Images.SolarCard,
  [School.Shadow]: Images.ShadowCard
};

const TITLE_TEXT_SIZE = 26;
const COST_TEXT_SIZE = 40;
const ACCURACY_TEXT_SIZE = 36;
const STROKE_THICKNESS = 1.5;
const SELECTION_STROKE_THICKNESS = 3;

export function BaseCardButton({ spellCard, layoutOrder, grayscale, selected, hovered, unhovered, leftClicked, rightClicked }: BaseCardButtonProps): Vide.Node {
  const px = usePx();
  const baseZIndex = source(0);
  const belowCardZIndex = () => baseZIndex() - 1;
  const cardFrameImage = () => read(grayscale)
    ? GRAYSCALE_CARD_IMAGES[spellCard.kind]
    : spellCard.kind === SpellCardKind.Normal
      ? SCHOOL_CARD_IMAGES[spellCard.spell.school]
      : spellCard.kind === SpellCardKind.Treasure
        ? Images.TreasureCard
        : Images.ItemCard;

  const cardImage = () => {
    const art = CARD_ART_SPRITESHEETS[spellCard.spell.cardArtSpritesheetNumber - 1];
    return read(grayscale) ? art.grayscale : art.colored;
  };

  return (
    <frame Name="CardDesign"
      AnchorPoint={anchorPoints.center}
      Position={positions.center}
      BackgroundTransparency={1}
      ClipsDescendants={true}
      Size={UDim2.fromOffset(cardReferenceWidth, cardReferenceHeight)}
    >
      <uistroke
        Color={palette.white}
        Thickness={SELECTION_STROKE_THICKNESS}
        Transparency={() => read(selected) ?? false ? 0.1 : 1}
      />
      <WizText name="Title"
        text={spellCard.spell.name}
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromScale(0, 0.035))}
        textColor={palette.white}
        textSize={TITLE_TEXT_SIZE}
        size={UDim2.fromScale(1, 0.08)}
        dropShadow={px(1)}
      >
        <uistroke Thickness={STROKE_THICKNESS} Transparency={0.7} />
      </WizText>
      <WizText name="Cost"
        text={tostring(spellCard.spell.cost.pips)}
        anchorPoint={anchorPoints.center}
        position={positions.topLeft.add(UDim2.fromScale(0.135, 0.2))}
        textSize={COST_TEXT_SIZE}
        size={UDim2.fromScale(0.15, 0.15)}
      >
        <uiaspectratioconstraint />
        <uistroke Thickness={STROKE_THICKNESS} Transparency={0.3} />
      </WizText>
      <WizText name="Accuracy"
        text={spellCard.spell.accuracy + "%"}
        backgroundTransparency={1}
        anchorPoint={anchorPoints.center}
        position={positions.bottomLeft.add(UDim2.fromScale(0.15, -0.43))}
        font={Enum.Font.Cartoon}
        textSize={ACCURACY_TEXT_SIZE}
        size={UDim2.fromScale(0.225, 0.1)}
        dropShadow={px(2)}
      >
        <uistroke Thickness={STROKE_THICKNESS} Transparency={0.3} />
      </WizText>
      <SchoolIcon school={spellCard.spell.school}
        anchorPoint={anchorPoints.center}
        position={positions.topRight.add(UDim2.fromScale(-0.125, 0.195))}
        size={new UDim(0.18)}
      />
      <SpellKindIcon
        kind={spellCard.spell.kind}
        size={new UDim(0.18)}
        position={positions.bottomRight.add(UDim2.fromScale(-0.129, -0.429))}
      />
      <CardDescription parts={spellCard.spell.description} />
      <CardBackground name="CardFrame"
        image={cardFrameImage}
        layoutOrder={layoutOrder}
        zIndex={baseZIndex}
        hovered={hovered}
        unhovered={unhovered}
        leftClicked={leftClicked}
        rightClicked={rightClicked}
      />
      <SpritesheetIcon name="SpellImage"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromOffset(0, 6))}
        size={UDim2.fromScale(0.95, 0.95)}
        spritesheetImage={cardImage}
        iconSize={SPELL_ART_SIZE}
        offset={spellCard.spell.cardImageOffset}
        zIndex={belowCardZIndex}
      >
        <uiaspectratioconstraint />
      </SpritesheetIcon>
    </frame>
  );
}
