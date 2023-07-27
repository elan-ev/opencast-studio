import { useTranslation } from "react-i18next";
import { LuRotateCw } from "react-icons/lu";
import { screenWidthAtMost } from "@opencast/appkit";

import { useDispatch, useStudioState } from "../../studio-state";
import { StepProps } from "..";
import { StepContainer } from "../elements";
import { COLORS } from "../../util";
import { SaveLocally } from "./save-locally";
import { UploadBox } from "./upload";



export const Finish: React.FC<StepProps> = ({ goToPrevStep, goToFirstStep }) => {
  const { t } = useTranslation();
  const { recordings, upload: uploadState } = useStudioState();
  const dispatch = useDispatch();

  const allDownloaded = recordings.every(rec => rec.downloaded);
  const possiblyDone = (uploadState.state === "uploaded" || allDownloaded)
    && uploadState.state !== "uploading";
  const hideBack = uploadState.state !== "not_uploaded" || allDownloaded;


  return (
    <StepContainer
      title={t("steps.finish.label")}
      prevButton={hideBack ? undefined : {
        onClick: goToPrevStep,
      }}
      // TODO: return to prev page if return.target is set
      nextButton={{
        label: t("save-creation-new-recording"),
        icon: <LuRotateCw />,
        disabled: !possiblyDone,
        onClick: () => {
          const doIt = window.confirm(t("save-creation-new-recording-warning"));
          if (doIt) {
            dispatch({ type: "RESET" });
            goToFirstStep();
          }
        },
      }}
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
