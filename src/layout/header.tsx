import { HiOutlineTranslate } from "react-icons/hi";
import { FiInfo, FiMoon } from "react-icons/fi";
import {
  HeaderMenuItemProps, useColorScheme, WithHeaderMenu, checkboxMenuItem,
} from "@opencast/appkit";
import { useTranslation } from "react-i18next";
import React, { forwardRef } from "react";

import { DEFINES } from "../defines";
import languages from "../i18n/languages";
import { BREAKPOINTS, COLORS } from "../util";


export const Header: React.FC = () => (
  <div css={{
    "--header-height": "64px",
    backgroundColor: COLORS.neutral60,
    height: "var(--header-height)",
    display: "flex",
    justifyContent: "space-between",
  }}>
    <Logo />
    <Buttons />
  </div>
);

const Logo: React.FC = () => {
  const path = (filename: string) => DEFINES.publicPath
    + (DEFINES.publicPath.endsWith("/") ? "" : "/")
    + filename;

  return (
    <picture css={{
      height: "100%",
      display: "flex",
      paddingLeft: 8,
      alignItems: "center",
      "> *": {
        height: "calc(100% - 12px)",
      },
    }}>
      <source media="(min-width: 920px)" srcSet={path("logo-wide.svg")} />
      <img src={path("logo-narrow.svg")} alt="Opencast Studio Logo" />
    </picture>
  );
};

const Buttons: React.FC = () => {

  return (
    <div css={{
      display: "flex",
      gap: 16,
      height: "100%",
      alignItems: "center",
      paddingRight: 24,
    }}>
      <LanguageButton />
      <ThemeButton />
      <InfoButton />
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

const InfoButton: React.FC = () => {
  const { t } = useTranslation();
  return (
    <HeaderButton icon={<FiInfo />} label={t("header.info.label")} />
  );
};

type HeaderButtonProps = JSX.IntrinsicElements["button"] & {
  icon: JSX.Element;
  label: string;
};

const BUTTON_LABEL_BREAKPOINT = 640;

const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ icon, label, ...rest }, ref) => (
    <button type="button" ref={ref} {...rest} css={{
      display: "flex",
      gap: 8,
      alignItems: "center",

      background: "none",
      border: "none",
      fontSize: 16,
      fontFamily: "inherit",
      fontWeight: 500,
      color: COLORS.neutral05,
      borderRadius: 6,
      cursor: "pointer",
      padding: "6px 8px",

      ":hover, :active": {
        outline: `2px solid ${COLORS.neutral50}`,
        backgroundColor: COLORS.neutral70,
      },

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
    </button>
  )
);
