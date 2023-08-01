import { HiOutlineTranslate } from "react-icons/hi";
import { FiInfo, FiMoon } from "react-icons/fi";
import {
  HeaderMenuItemProps, useColorScheme, WithHeaderMenu, checkboxMenuItem, ProtoButton, screenWidthAtMost,
} from "@opencast/appkit";
import { useTranslation } from "react-i18next";
import React, { forwardRef } from "react";

import { DEFINES } from "../defines";
import KeyboardIcon from "../icons/keyboard.svg";
import languages from "../i18n/languages";
import { BREAKPOINTS, COLORS, focusStyle } from "../util";
import { OverlayBoxState } from ".";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../shortcuts";


type Props = {
  setOverlayBoxState: (state: OverlayBoxState) => void;
};

export const Header: React.FC<Props> = ({ setOverlayBoxState }) => {
  const { scheme } = useColorScheme();

  return (
    <div css={{
      backgroundColor: scheme === "light" ? COLORS.neutral60 : COLORS.neutral20,
      height: "var(--header-height)",
      display: "flex",
      justifyContent: "space-between",
    }}>
      <Logo />
      <Buttons {...{ setOverlayBoxState }}/>
    </div>
  );
};

const Logo: React.FC = () => {
  const path = (filename: string) => DEFINES.publicPath
    + (DEFINES.publicPath.endsWith("/") ? "" : "/")
    + filename;
  const isLight = useColorScheme().scheme === "light";

  return (
    <picture css={{
      height: "100%",
      display: "flex",
      opacity: isLight ? 1.0 : 0.8,
      paddingLeft: 8,
      alignItems: "center",
      "> *": {
        height: "calc(100% - 12px)",
      },
      [screenWidthAtMost(410)]: {
        paddingLeft: 0,
      },
    }}>
      <source media="(min-width: 920px)" srcSet={path("logo-wide.svg")} />
      <img src={path("logo-narrow.svg")} alt="Opencast Studio Logo" />
    </picture>
  );
};

const Buttons: React.FC<Props> = ({ setOverlayBoxState }) => {

  return (
    <div css={{
      display: "flex",
      gap: 16,
      height: "100%",
      alignItems: "center",
      paddingRight: 24,
      [screenWidthAtMost(410)]: {
        gap: 2,
        paddingRight: 8,
      },
    }}>
      <LanguageButton />
      <ThemeButton />
      <ShortCutsButton open={() => setOverlayBoxState("shortcuts")} />
      <InfoButton open={() => setOverlayBoxState("info")} />
    </div>
  );
};

const LanguageButton: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isCurrentLanguage = (language: string) => language === i18n.resolvedLanguage;

  const menuItems = Object.values(languages).map(lng => checkboxMenuItem({
    checked: isCurrentLanguage(lng.short),
    children: <>{lng.long}</>,
    onClick: () => {
      if (!isCurrentLanguage(lng.short)) {
        i18n.changeLanguage(lng.short);
      }
    },
  }));

  const label = t("header.language.label");
  return (
    <WithHeaderMenu
      menu={{
        label,
        items: menuItems,
        breakpoint: BREAKPOINTS.small,
      }}
    >
      <HeaderButton icon={<HiOutlineTranslate />} label={label} />
    </WithHeaderMenu>
  );
};

const ThemeButton: React.FC = () => {
  const { t } = useTranslation();
  const { scheme, isAuto, update } = useColorScheme();

  const currentPref = isAuto ? "auto" : scheme;
  const choices = ["auto", "light", "dark"] as const;
  const menuItems: HeaderMenuItemProps[] = choices.map(choice => checkboxMenuItem({
    checked: currentPref === choice,
    children: <>{t(`header.theme.${choice}`)}</>,
    onClick: () => update(choice),
  }));

  return (
    <WithHeaderMenu
      menu={{
        label: t("header.theme.label"),
        items: menuItems,
        breakpoint: BREAKPOINTS.small,
      }}
    >
      <HeaderButton icon={<FiMoon />} label={t("header.theme.label")} />
    </WithHeaderMenu>
  );
};

type BoxOpenButtonProps = {
  open: () => void;
};

const InfoButton: React.FC<BoxOpenButtonProps> = ({ open }) => {
  const { t } = useTranslation();
  return (
    <HeaderButton onClick={open} icon={<FiInfo />} label={t("header.info.label")} />
  );
};

const ShortCutsButton: React.FC<BoxOpenButtonProps> = ({ open }) => {
  const { t } = useTranslation();
  useShortcut(SHORTCUTS.general.showOverview, open, { ignoreModifiers: true });
  const showShortcut = useShowAvailableShortcuts();
  return (
    <HeaderButton onClick={open} icon={<KeyboardIcon />} label={t("shortcuts.label")}>
      {showShortcut && (
        <div css={{
          position: "absolute",
          bottom: -20,
          left: 20,
          padding: 2,
          borderRadius: 4,
          backgroundColor: COLORS.neutral05,
        }}><ShortcutKeys shortcut={SHORTCUTS.general.showOverview} /></div>
      )}
    </HeaderButton>
  );
};

type HeaderButtonProps = JSX.IntrinsicElements["button"] & {
  icon: JSX.Element;
  label: string;
};

const BUTTON_LABEL_BREAKPOINT = 770;

const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ icon, label, children, ...rest }, ref) => {
    const isLight = useColorScheme().scheme === "light";

    return (
      <ProtoButton {...rest} ref={ref} css={{
        position: "relative",
        display: "flex",
        gap: 8,
        alignItems: "center",

        fontSize: 16,
        fontFamily: "inherit",
        fontWeight: 500,
        color: isLight ? COLORS.neutral05 : COLORS.neutral90,
        borderRadius: 6,
        padding: "6px 8px",

        ":hover, :active": {
          outline: `2px solid ${COLORS.neutral50}`,
          backgroundColor: isLight ? COLORS.neutral70 : COLORS.neutral10,
        },
        ...focusStyle({}, isLight ? COLORS.neutral10 : COLORS.accent8),

        "> svg": {
          fontSize: 22,
          [`@media (max-width: ${BUTTON_LABEL_BREAKPOINT}px)`]: {
            fontSize: 26,
          },
        },
      }}>
        {icon}
        <span css={{
          [`@media (max-width: ${BUTTON_LABEL_BREAKPOINT}px)`]: {
            display: "none",
          },
        }}>{label}</span>
        {children}
      </ProtoButton>
    );
  }
);
