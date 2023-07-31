import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FiDownload } from "react-icons/fi";
import { LuCheckCircle2 } from "react-icons/lu";

import { useDispatch, useStudioState } from "../../studio-state";
import { recordingFileName } from "../../util";
import { SHORTCUTS, ShortcutKeys, useShortcut, useShowAvailableShortcuts } from "../../shortcuts";
import { sharedButtonStyle } from ".";



export const SaveLocally: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { recordings, title, presenter } = useStudioState();
  const dispatch = useDispatch();
  const showShortcuts = useShowAvailableShortcuts();

  const buttons = recordings.map(() => useRef<HTMLAnchorElement>(null));
  useShortcut(SHORTCUTS.finish.download, () => {
    for (const button of buttons) {
      button.current?.click();
    }
  });

  return recordings.map((recording, i) => {
    const { deviceType, mimeType, url, downloaded, media: blob } = recording;
    const flavor = deviceType === "desktop" ? t("sources-display") : t("sources-user");
    const downloadName = recordingFileName({ mime: mimeType, flavor, title, presenter });

    if (!url) {
      return null;
    }

    // Get file size in human readable format. We use base-1000 XB instead of
    // base-1024 XiB, as the latter would probably confuse some users and many
    // file managers use base-1000 anyway. Notably, the windows file manager
    // calculates with base-1024 but shows "XB". So it is lying.
    const numBytes = blob.size;
    const round = (n: number) => {
      const digits = n < 10 ? 1 : 0;
      return n.toLocaleString(i18n.language, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    };
    const prettyFileSize = (() => {
      if (numBytes < 1000) {
        return `${numBytes} B`;
      } else if (numBytes < 999_500) {
        return `${round(numBytes / 1000)} KB`;
      } else if (numBytes < 999_500_000) {
        return `${round(numBytes / (1_000_000))} MB`;
      } else {
        return `${round(numBytes / (1_000_000_000))} GB`;
      }
    })();

    return (
      <div key={i} css={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ":not(:first-of-type)": {
          marginTop: 32,
        },
      }}>
        <div css={{
          position: "relative",
        }}>
          <video
            tabIndex={-1}
            muted
            src={url}
            // Without this, some browsers show a black video element instead of the first frame.
            onLoadedData={e => e.currentTarget.currentTime = 0}
            preload="auto"
            css={{
              borderRadius: 4,
              display: "block",
              maxHeight: 190,
              margin: "0 auto",
            }}
          />
          {downloaded && (
            <div css={{
              position: "absolute",
              bottom: 0,
              right: 0,
              left: 0,
              color: "white",
              backgroundColor: "rgba(30, 30, 30, 0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              padding: 12,
              borderRadius: "0 0 4px 4px",
            }}>
              <LuCheckCircle2 css={{ fontSize: 22 }} />
              {t("steps.finish.recording-saved")}
            </div>
          )}
        </div>
        <a
          ref={buttons[i]}
          target="_blank"
          download={downloadName}
          href={url}
          rel="noopener noreferrer"
          role="button"
          onClick={() => dispatch({ type: "MARK_DOWNLOADED", index: i })}
          css={{
            ...sharedButtonStyle,
            justifyContent: "center",
            maxWidth: 260,
            margin: "auto",
            marginTop: 8,
          }}
        >
          <FiDownload css={{ fontSize: 20 }} />
          {t("steps.finish.save-locally") + " (" + prettyFileSize + ")"}
          {showShortcuts && (
            <div css={{ position: "absolute", right: -4, bottom: -4 }}>
              <ShortcutKeys shortcut={SHORTCUTS.finish.download} />
            </div>
          )}
        </a>
      </div>
    );
  });
};
