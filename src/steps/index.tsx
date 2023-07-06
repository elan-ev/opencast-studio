import { useState } from "react";
import { useTranslation } from "react-i18next";
import { match, screenWidthAbove, screenWidthAtMost } from "@opencast/appkit";
import { FiCircle } from "react-icons/fi";

import StepCurrent from "../icons/step-current.svg";
import StepDone from "../icons/step-done.svg";
import { BREAKPOINTS, COLORS } from "../util";


export type Step = "video-select" | "audio-select" | "recording" | "review" | "finish";

export const Main: React.FC = () => {
  const [currentStep, _setCurrentStep] = useState<Step>("audio-select");

  return (
    <main css={{
      display: "flex",
      flex: 1,
      overflow: "hidden",
      [screenWidthAtMost(BREAKPOINTS.large)]: {
        flexDirection: "column-reverse",
      },
    }}>
      <ProgressSidebar currentStep={currentStep} />
      <div css={{
        backgroundColor: COLORS.neutral10,
      }}>
      </div>
    </main>
  );
};


type ProgressSidebarProps = {
  currentStep: Step;
};

/**
 * The element that shows the progress through the five steps. Shown left on
 * desktop, at the bottom on mobile.
 */
const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  const currentIndex = match(currentStep, {
    "video-select": () => 0,
    "audio-select": () => 1,
    "recording": () => 2,
    "review": () => 3,
    "finish": () => 4,
  });
  const labels = [
    t("steps.video.label"),
    t("steps.audio.label"),
    t("steps.record.label"),
    t("steps.review.label"),
    t("steps.finish.label"),
  ];

  const VERTICAL_MARGIN = "calc(8px + max(0px, 20% - 44px))";
  const CIRCLE_RADIUS = 13;
  return (
    <div css={{
      position: "relative",
      backgroundColor: COLORS.neutral05,
      [screenWidthAbove(BREAKPOINTS.large)]: {
        width: 160,
      },
      [screenWidthAtMost(BREAKPOINTS.large)]: {
        height: 42,
      },
    }}>
      <div css={{
        position: "absolute",
        display: "flex",
        justifyContent: "space-between",
        [screenWidthAbove(BREAKPOINTS.large)]: {
          flexDirection: "column",
          left: 8,
          top: VERTICAL_MARGIN,
          bottom: VERTICAL_MARGIN,
        },
        [screenWidthAtMost(BREAKPOINTS.large)]: {
          flexDirection: "row",
          top: 8,
          left: VERTICAL_MARGIN,
          right: VERTICAL_MARGIN,
        },
      }}>
        {labels.map((label, i) => {
          let icon: JSX.Element;
          if (i < currentIndex) {
            icon = <StepDone />;
          } else if (i === currentIndex) {
            icon = <StepCurrent />;
          } else {
            icon = <FiCircle />;
          }

          return (
            <div key={i} css={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              zIndex: 100,
              backgroundColor: "white",
              svg: {
                color: i === currentIndex ? "#4DA1F7" : "#9CA3AF", // TODO
                fontSize: 2 * CIRCLE_RADIUS,
                flexShrink: 0,
                // We want an effective stroke width of 2. If we scale the icon
                // via `size`, the internal stroke width (of 2) gets scaled as
                // well. So we override it by applying the inverse scaling. The
                // intrinsic size of the SVG is 24.
                strokeWidth: 2 * 24 / (2 * CIRCLE_RADIUS),
                [screenWidthAbove(BREAKPOINTS.large)]: {
                  margin: "4px 0",
                },
                [screenWidthAtMost(BREAKPOINTS.large)]: {
                  margin: "0 4px",
                },
              },
            }}>
              {icon}
              <div css={{
                fontSize: 14,
                lineHeight: 1.2,
                color: i == currentIndex ? "#3E8AD8" : "#4B5563", // TODO
                [screenWidthAtMost(BREAKPOINTS.large)]: {
                  display: "none",
                },
              }}>{label}</div>
            </div>
          );
        })}

        {/* Line connecting all steps */}
        <div css={{
          position: "absolute",
          border: "1px solid #9CA3AF", // TODO
          [screenWidthAbove(BREAKPOINTS.large)]: {
            top: CIRCLE_RADIUS,
            bottom: CIRCLE_RADIUS,
            left: CIRCLE_RADIUS - 1, // Border is 2px wide and we want to center that
          },
          [screenWidthAtMost(BREAKPOINTS.large)]: {
            left: CIRCLE_RADIUS,
            right: CIRCLE_RADIUS,
            top: CIRCLE_RADIUS - 1, // Border is 2px wide and we want to center that
          },
        }} />
      </div>
    </div>
  );
};
