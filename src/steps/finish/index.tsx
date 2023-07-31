import { useTranslation } from "react-i18next";
import { LuRotateCw } from "react-icons/lu";
import { screenWidthAtMost } from "@opencast/appkit";

import { useDispatch, useStudioState } from "../../studio-state";
import { StepProps } from "..";
import { StepContainer } from "../elements";
import { COLORS } from "../../util";
import { SaveLocally } from "./save-locally";
import { UploadBox } from "./upload";
import { FiXCircle } from "react-icons/fi";
import { Settings, useSettings } from "../../settings";
import { SHORTCUTS, useShortcut } from "../../shortcuts";




export const Finish: React.FC<StepProps> = ({ goToPrevStep, goToFirstStep }) => {
  const { t } = useTranslation();
  const { recordings, upload: uploadState } = useStudioState();
  const dispatch = useDispatch();
  const settings = useSettings();

  const allDownloaded = recordings.every(rec => rec.downloaded);
  const possiblyDone = (uploadState.state === "uploaded" || allDownloaded)
    && uploadState.state !== "uploading";
  const hideBack = uploadState.state !== "not_uploaded" || allDownloaded;

  const startAgain = {
    label: t("save-creation-new-recording"),
    icon: <LuRotateCw />,
    onClick: () => {
      const doIt = window.confirm(t("save-creation-new-recording-warning"));
      if (doIt) {
        dispatch({ type: "RESET" });
        goToFirstStep();
      }
    },
  };
  const returnTarget = getReturnTarget(settings);
  const nextButton = returnTarget
    ? {
      label: t("steps.finish.finish-button"),
      disabled: !possiblyDone,
      popoverEntries: [
        startAgain,
        {
          label: settings.return?.label
            ? t("save-creation-return-to", { label: settings.return.label })
            : t("save-creation-return-to-no-label"),
          href: returnTarget,
          icon: <FiXCircle />,
        },
      ],
    }
    : {
      disabled: !possiblyDone,
      ...startAgain,
    };

  useShortcut(SHORTCUTS.finish.startNewRecording, startAgain.onClick, {
    enabled: possiblyDone,
  });

  return (
    <StepContainer
      title={t("steps.finish.label")}
      prevButton={hideBack ? undefined : { onClick: goToPrevStep }}
      nextButton={nextButton}
    >
      {/* A spacer to push the boxes a bit further up */}
      <div css={{ height: "calc(35%)" }}/>

      <div css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        gap: 16,
        [screenWidthAtMost(700)]: {
          flexDirection: "column",
          alignItems: "center",
        },
      }}>
        <Box title={t("save-creation-button-upload")}>
          <UploadBox />
        </Box>
        <Box title={t("steps.finish.save-locally")}>
          <SaveLocally />
        </Box>
      </div>

      {/* A spacer to push the boxes a bit further up */}
      <div css={{ height: "calc(65%)" }}/>
    </StepContainer>
  );
};

type BoxProps = React.PropsWithChildren<{
  title: string;
}>;

const Box: React.FC<BoxProps> = ({ title, children }) => {
  return (
    <div css={{
      maxWidth: 420,
      width: "100%",
      backgroundColor: COLORS.neutral05,
      boxShadow: "0 4px 16px var(--shadow-color)",
      border: `1px solid ${COLORS.neutral15}`,
      padding: "24px 32px",
      borderRadius: 6,
      minHeight: 330, // Make both boxes same height in common use cases
    }}>
      <h2 css={{
        textAlign: "center",
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 12,
      }}>{title}</h2>
      {children}
    </div>
  );
};


const getReturnTarget = (settings: Settings) => {
  if (!settings.return?.target) {
    return null;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(settings.return.target, window.location.href);
  } catch {
    return null;
  }

  const allowedDomains = [window.location.hostname, ...(settings.return?.allowedDomains || [])];
  const allowed = allowedDomains.some(domain => targetUrl.hostname === domain)
    && (targetUrl.protocol === "https:" || targetUrl.protocol === "http:");

  if (!allowed) {
    return null;
  }

  return settings.return.target;
};
