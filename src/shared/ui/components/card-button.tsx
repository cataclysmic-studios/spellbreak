import Vide, { type Source, type Derivable, type PropsWithChildren, source, read } from "@rbxts/vide";
import { Players } from "@rbxts/services";
import { useEventListener } from "@rbxts/pretty-vide-utils";

import { usePx } from "../hooks/use-px";
import { Images } from "../utility/images";
import { Palette } from "../palette";
import { anchorPoints, positions } from "../utility/positioning";
import { cardArtSpritesheets, cardAspectRatio, grayscaleCardImages, schoolCardImages } from "shared/constants";
import { CardKind, type SpellCard } from "shared/structs/spell-card";

import { BaseCardButton } from "./base-card-button";
import { Container } from "../utility/components/container";
import { SpritesheetIcon } from "./spritesheet-icon";
import { WizText } from "./wiz-text";
import { SchoolIcon } from "./school-icon";
import { SpellType } from "shared/structs/spell";
import { LargeSpritesheetIcon } from "./large-spritsheet-icon";

interface CardButtonProps {
  readonly spellCard: SpellCard;
  readonly layoutOrder: Derivable<number>;
  readonly grayscale?: Source<boolean>;
}

const SPELL_ART_SIZE = 64;
const SPELL_TYPE_IMAGES: Record<SpellType, string> = {
  [SpellType.Damage]: "rbxassetid://108143298466355",
  [SpellType.AOE]: "rbxassetid://118350657741477",
  [SpellType.Drain]: "rbxassetid://109389322750574",
  [SpellType.Heal]: "rbxassetid://108034974071682",
  [SpellType.Charm]: "rbxassetid://93511865864214",
  [SpellType.Curse]: "rbxassetid://119491980571867",
  [SpellType.Trap]: "rbxassetid://97697467985473",
  [SpellType.Jinx]: "rbxassetid://135872189432164",
  [SpellType.Ward]: "rbxassetid://91030799412195",
  [SpellType.Aura]: "rbxassetid://137432911637486",
  [SpellType.Global]: "rbxassetid://137993823959278",
  [SpellType.Enchantment]: "rbxassetid://89333027044620",
  [SpellType.Manipulation]: "rbxassetid://133882234415702",
  [SpellType.Polymorph]: "rbxassetid://109141779555025",
  [SpellType.Mutate]: "rbxassetid://86695891024037"
};

const mouse = Players.LocalPlayer.GetMouse();

export function CardButton({ spellCard, layoutOrder, grayscale, children }: PropsWithChildren<CardButtonProps>): Vide.Node {
  const baseZIndex = source(0);
  const selected = source(false);
  const hovered = source(false);
  const belowCardZIndex = () => baseZIndex() - 1;
  const isGrayscale = () => grayscale?.() ?? false;
  const cardFrameImage = () => isGrayscale()
    ? grayscaleCardImages[spellCard.cardKind]
    : spellCard.cardKind === CardKind.Normal
      ? schoolCardImages[spellCard.spell.school]
      : spellCard.cardKind === CardKind.Treasure
        ? Images.TreasureCard
        : Images.ItemCard;

  const cardImage = () => {
    const art = cardArtSpritesheets[spellCard.spell.cardArtSpritesheetNumber];
    return isGrayscale() ? art.grayscale : art.colored;
  };

  const px = usePx();

  useEventListener(mouse.Button1Down, () => {
    if (hovered()) return;
    selected(false);
  });

  return (
    <Container name={spellCard.spell.name + "Card"} clipsDescendants={true}>
      <uiaspectratioconstraint AspectRatio={cardAspectRatio} />
      <WizText
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.sub(UDim2.fromScale(0, 0.025))}
        text={spellCard.spell.name}
        textColor={Palette.white}
        textScaled={true}
        size={UDim2.fromScale(1, 0.08)}
      >
        <uistroke Thickness={px.scale(1)} Transparency={0.7} />
      </WizText>
      <WizText
        anchorPoint={anchorPoints.center}
        position={positions.topLeft.add(UDim2.fromScale(0.128, 0.13))}
        text={tostring(spellCard.spell.cost.pips)}
        textScaled={true}
        size={UDim2.fromScale(0.15, 0.15)}
      >
        <uiaspectratioconstraint />
        <uistroke Thickness={px.scale(1)} Transparency={0.3} />
      </WizText>

      <WizText
        backgroundTransparency={1}
        anchorPoint={anchorPoints.center}
        position={positions.bottomLeft.add(UDim2.fromScale(0.128, -0.43))}
        font={Enum.Font.Cartoon}
        text={spellCard.spell.accuracy + "%"}
        textScaled={true}
        size={UDim2.fromScale(0.225, 0.1)}
      >
        <uistroke Thickness={px.scale(1)} Transparency={0.3} />
      </WizText>
      <SchoolIcon
        anchorPoint={anchorPoints.center}
        position={positions.topRight.add(UDim2.fromScale(-0.125, 0.195))}
        school={spellCard.spell.school}
        size={UDim2.fromScale(0.18, 0.18)}
      />
      <imagelabel
        AnchorPoint={anchorPoints.center}
        Position={positions.bottomRight.add(UDim2.fromScale(-0.129, -0.433))}
        BackgroundTransparency={1}
        Size={UDim2.fromScale(0.18, 0.18)}
        Image={SPELL_TYPE_IMAGES[spellCard.spell.type]}
      >
        <uiaspectratioconstraint />
      </imagelabel>
      {/** TODO: implement actual description */}
      <WizText
        backgroundTransparency={1}
        anchorPoint={anchorPoints.center}
        position={positions.bottomCenter.sub(UDim2.fromScale(0, 0.2))}
        font={Enum.Font.Cartoon}
        text={"my long ass spell description"}
        textColor={Palette.black}
        textScaled={true}
        alignX={Enum.TextXAlignment.Left}
        alignY={Enum.TextYAlignment.Top}
        size={UDim2.fromScale(0.825, 0.25)}
      />
      <BaseCardButton
        image={cardFrameImage}
        layoutOrder={layoutOrder}
        zIndex={baseZIndex}
        hovered={() => hovered(true)}
        unhovered={() => hovered(false)}
        activated={() => selected(!selected())}
      >
        {children}
      </BaseCardButton>
      <SpritesheetIcon name="SpellImage"
        anchorPoint={anchorPoints.topCenter}
        position={positions.topCenter.add(UDim2.fromOffset(0, px(6)))}
        size={UDim2.fromScale(0.95, 0.95)}
        spritesheetImage={cardImage}
        iconSize={SPELL_ART_SIZE}
        offset={spellCard.spell.cardImageOffset}
        zIndex={belowCardZIndex}
      >
        <uiaspectratioconstraint />
      </SpritesheetIcon>
      <imagelabel Name="SelectionBorder"
        BackgroundTransparency={1}
        Size={UDim2.fromScale(1, 1)}
        Image={Images.CardSelectionBorder}
        Visible={selected}
        ZIndex={belowCardZIndex}
      />
    </Container >
  );
}