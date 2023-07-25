import { ProtoButton, match } from "@opencast/appkit";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CSSObject } from "@emotion/react";

import { COLORS, focusStyle } from "../util";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../shortcuts";


type StepButtonProps = {
  kind: "next" | "prev";
  label?: string;
  danger?: boolean;
  icon?: JSX.Element,
  disabled?: boolean;
  onClick?: () => void;
};

const StepButton: React.FC<StepButtonProps> = ({
  kind, label, icon, disabled, danger, onClick,
}) => {
  const { t } = useTranslation();
  const showShortcut = useShowAvailableShortcuts();
  const shortcut = match(kind, {
    prev: () => SHORTCUTS.general.prev,
    next: () => SHORTCUTS.general.next,
  });
  useShortcut(shortcut, () => onClick?.(), { enabled: !disabled });

  return (
    <ProtoButton
      disabled={disabled}
      onClick={onClick}
      css={{
        position: "relative",
        display: "flex",
        gap: 8,
        alignItems: "center",
        lineHeight: 1,

        ...focusStyle({ offset: -1 }),
        ...danger && { "--color-focus": COLORS.danger4 },

        borderRadius: 8,
        border: `1px solid ${danger ? COLORS.danger4 : COLORS.neutral40}`,
        color: danger ? COLORS.danger4 : COLORS.neutral70,
        backgroundColor: danger ? COLORS.danger0 : COLORS.neutral05,
        padding: "8px 24px",
        ...match(kind, {
          "next": () => ({ paddingRight: 16 }) as CSSObject,
          "prev": () => ({ paddingLeft: 16 }) as CSSObject,
        }),

        "&[disabled]": {
          color: COLORS.neutral60,
          borderColor: COLORS.neutral15,
          backgroundColor: COLORS.neutral15,
        },

        "&:not([disabled]):hover, &:not([disabled]):focus-visible": {
          borderColor: danger ? COLORS.danger5 : COLORS.neutral70,
          color: danger ? COLORS.danger5 : COLORS.neutral90,
          boxShadow: `0 0 8px ${COLORS.neutral25}`,
          ...danger && { backgroundColor: COLORS.danger1 },
        },
      }}
    >
      {kind === "prev" && (icon ?? <FiChevronLeft />)}
      {label ?? t(`steps.${kind}-button-label`)}
      {kind === "next" && (icon ?? <FiChevronRight />)}
      {showShortcut && !disabled && (
        <div css={{
          position: "absolute",
          top: -24,
          left: -6,
          padding: 2,
          borderRadius: 4,
          backgroundColor: COLORS.neutral05,
        }}><ShortcutKeys shortcut={shortcut} /></div>
      )}
    </ProtoButton>
  );
};

type StepContainerProps = React.PropsWithChildren<{
  title: string;
  note?: string;
  nextButton?: Omit<StepButtonProps, "kind">,
  prevButton?: Omit<StepButtonProps, "kind">,
}>;

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  note,
  nextButton,
  prevButton,
  children,
}) => {
  return (
    <div css={{
      flex: "1",
      minWidth: "var(--min-page-width)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 12,
      "@media (min-width: 500px) and (min-height: 500px)": {
        gap: 16,
        padding: 24,
      },
    }}>
      <div>
        <h1 css={{
          textAlign: "center",
          fontSize: 32,
          fontWeight: 700,
          color: COLORS.neutral70,
          "@media screen and (max-width: 600px), screen and (max-height: 400px)": {
            fontSize: 26,
          },
        }}>{title}</h1>
        {note && (
          <div css={{
            fontSize: 14,
            color: COLORS.neutral60,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "100ch",
            margin: "0 auto",
          }}>
            {note}
          </div>
        )}
      </div>
      <div css={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
      }}>
        {children}
      </div>
      <div css={{
        display: "flex",
        justifyContent: "end",
        gap: 8,
        height: 42,
      }}>
        {prevButton && <StepButton kind="prev" {...prevButton} />}
        {nextButton && <StepButton kind="next" {...nextButton} />}
      </div>
    </div>
  );
};
