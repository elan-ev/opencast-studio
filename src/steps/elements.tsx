import { ProtoButton, match } from "@opencast/appkit";
import { useTranslation } from "react-i18next";
import { COLORS, focusStyle } from "../util";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { CSSObject } from "@emotion/react";

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

  return (
    <ProtoButton
      disabled={disabled}
      onClick={onClick}
      css={{
        display: "flex",
        gap: 8,
        alignItems: "center",

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
    </ProtoButton>
  );
};

type StepContainerProps = React.PropsWithChildren<{
  title: string;
  // subtitle?: string;
  nextButton?: Omit<StepButtonProps, "kind">,
  prevButton?: Omit<StepButtonProps, "kind">,
}>;

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
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
      padding: 24,
      gap: 16,
    }}>
      <h1 css={{
        textAlign: "center",
        fontSize: 32,
        fontWeight: 700,
        color: COLORS.neutral70,
        "@media screen and (max-width: 600px), screen and (max-height: 400px)": {
          fontSize: 26,
        },
      }}>{title}</h1>
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
