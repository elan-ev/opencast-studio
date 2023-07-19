import React from "react";
import { useTranslation } from "react-i18next";
import { screenWidthAtMost } from "@opencast/appkit";
import { FiMonitor, FiUser } from "react-icons/fi";
import { useHotkeys } from "react-hotkeys-hook";

import { useDispatch, useStudioState, VideoSource } from "../../studio-state";
import { useSettings } from "../../settings";
import { queryMediaDevices, onMobileDevice, BREAKPOINTS } from "../../util";
import { startDisplayCapture, startUserCapture } from "../../capturer";
import { ErrorBox } from "../../ui/ErrorBox";
import { SHORTCUTS, useShowAvailableShortcuts } from "../../shortcuts";
import { SourceOptionButton } from "../../ui/SourceOptionButton";



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

  useHotkeys(SHORTCUTS.videoSetup.selectScreen, clickDisplay);
  useHotkeys(SHORTCUTS.videoSetup.selectBoth, clickBoth);
  useHotkeys(SHORTCUTS.videoSetup.selectUser, clickUser);
  const showShortcuts = useShowAvailableShortcuts();

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
      {(displaySupported || !onMobileDevice()) && <SourceOptionButton
        label={t("sources-scenario-display")}
        icon={<FiMonitor />}
        onClick={clickDisplay}
        disabledText={displaySupported ? false : t("sources-video-display-not-supported")}
        shortcut={showShortcuts ? SHORTCUTS.videoSetup.selectScreen : undefined}
      />}
      {(displaySupported || !onMobileDevice()) && userSupported && <SourceOptionButton
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
        shortcut={showShortcuts ? SHORTCUTS.videoSetup.selectBoth : undefined}
      />}
      {userSupported && <SourceOptionButton
        label={t("sources-scenario-user")}
        icon={<FiUser />}
        onClick={clickUser}
        disabledText={state.hasWebcam ? false : t("sources-video-no-cam-detected")}
        shortcut={showShortcuts ? SHORTCUTS.videoSetup.selectUser : undefined}
      />}
    </div>
  );
};
