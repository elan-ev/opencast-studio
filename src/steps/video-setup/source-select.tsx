import React from "react";
import { useTranslation } from "react-i18next";
import { ProtoButton, screenWidthAtMost } from "@opencast/appkit";
import { FiMonitor, FiUser } from "react-icons/fi";

import { useDispatch, useStudioState, VideoSource } from "../../studio-state";
import { useSettings } from "../../settings";
import { queryMediaDevices, onMobileDevice, COLORS, BREAKPOINTS, focusStyle } from "../../util";
import { startDisplayCapture, startUserCapture } from "../../capturer";
import { ErrorBox } from "../../ui/ErrorBox";



type SourceSelectionProps = {
  setActiveSource: (s: VideoSource) => void,
  userConstraints: MediaTrackConstraints,
  displayConstraints: MediaTrackConstraints,
};

export const SourceSelection: React.FC<SourceSelectionProps> = ({
  setActiveSource,
  userConstraints,
  displayConstraints,
}) => {
  const { t } = useTranslation();

  const settings = useSettings();
  const dispatch = useDispatch();
  const state = useStudioState();
  const { displaySupported, userSupported } = state;

  const clickUser = async () => {
    setActiveSource("user");
    await startUserCapture(dispatch, settings, userConstraints);
    await queryMediaDevices(dispatch);
  };

  const clickDisplay = async () => {
    setActiveSource("display");
    await startDisplayCapture(dispatch, settings, displayConstraints);
  };

  const clickBoth = async () => {
    setActiveSource("both");
    await startUserCapture(dispatch, settings, userConstraints);
    await Promise.all([
      queryMediaDevices(dispatch),
      startDisplayCapture(dispatch, settings, displayConstraints),
    ]);
  };

  if (!displaySupported && !userSupported) {
    return <ErrorBox body={t("sources-video-none-available")} />;
  }

  return (
    <div
      css={{
        display: "flex",
        gap: 24,
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
        flex: "1",
        [screenWidthAtMost(BREAKPOINTS.medium)]: {
          flexDirection: "column",
        },
      }}
    >
      {(displaySupported || !onMobileDevice()) && <OptionButton
        label={t("sources-scenario-display")}
        icon={<FiMonitor />}
        onClick={clickDisplay}
        disabledText={displaySupported ? false : t("sources-video-display-not-supported")}
      />}
      {(displaySupported || !onMobileDevice()) && userSupported && <OptionButton
        label={t("sources-scenario-display-and-user")}
        icon={(
          <div css={{
            lineHeight: 0,
            // The two icons are a bit smaller, but we make sure that they have
            // the same absolute stroke width.
            fontSize: "0.8em",
            svg: { strokeWidth: 2 / 0.8 },
          }}>
            <FiMonitor />
            <FiUser />
          </div>
        )}
        onClick={clickBoth}
        disabledText={
          displaySupported
            ? (state.hasWebcam ? false : t("sources-video-no-cam-detected"))
            : t("sources-video-display-not-supported")
        }
      />}
      { userSupported && <OptionButton
        label={t("sources-scenario-user")}
        icon={<FiUser />}
        onClick={clickUser}
        disabledText={state.hasWebcam ? false : t("sources-video-no-cam-detected")}
      />}
    </div>
  );
};

type OptionButtonProps = {
  icon: JSX.Element;
  label: string;
  onClick: () => void;
  disabledText: false | string;
};

const OptionButton: React.FC<OptionButtonProps> = (
  { icon, label, onClick, disabledText = false }
) => {
  const disabled = disabledText !== false;

  return (
    <ProtoButton
      onClick={onClick}
      disabled={disabled}
      css={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        maxHeight: 250,
        maxWidth: 420,
        padding: 12,
        flex: "1",

        backgroundColor: COLORS.neutral05,
        color: COLORS.neutral60,
        borderRadius: 8,
        border: `1px solid ${COLORS.neutral20}`,

        "&[disabled]": {
          backgroundColor: COLORS.neutral10,
          color: COLORS.neutral50,
          borderColor: COLORS.neutral15,
        },

        "&:not([disabled]):hover, &:not([disabled]):focus-visible": {
          color: COLORS.neutral90,
          borderColor: COLORS.neutral25,
          boxShadow: `0 0 16px ${COLORS.neutral20}`,
        },
        ...focusStyle({ offset: -1 }),
      }}
    >
      <div css={{
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 40,
        width: 80,
        height: 80,
        backgroundColor: COLORS.neutral10,
        marginBottom: 8,
      }}>
        {icon}
      </div>
      <div css={{ fontSize: 18, fontWeight: 700 }}>{label}</div>
      <div css={{ height: "1lh", fontSize: 14, marginTop: 4 }}>{disabledText}</div>
    </ProtoButton>
  );
};
