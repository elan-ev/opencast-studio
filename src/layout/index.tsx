import React, { useRef, useState } from "react";
import { match, screenWidthAtMost, useColorScheme, useOnOutsideClick } from "@opencast/appkit";
import { FiX } from "react-icons/fi";

import { Main } from "../steps";
import { Header } from "./header";
import { COLORS } from "../util";
import { About } from "../about";
import { SHORTCUTS, ShortcutOverview, useShortcut } from "../shortcuts";


export type OverlayBoxState = "none" | "info" | "shortcuts";

export const Root: React.FC = () => {
  const [overlayBoxState, setOverlayBoxState] = useState<OverlayBoxState>("none");
  const close = () => setOverlayBoxState("none");
  useShortcut(SHORTCUTS.general.closeOverlay, close);
  const inert = overlayBoxState !== "none";

  return (
    <div css={{
      "--header-height": "64px",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      ...overlayBoxState !== "none" && { overflowY: "hidden" },
    }}>
      <Header inert={inert} {...{ setOverlayBoxState }} />
      {match(overlayBoxState, {
        "none": () => null,
        "info": () => <OverlayBox maxWidth={800} close={close}>
          <About />
        </OverlayBox>,
        "shortcuts": () => <OverlayBox maxWidth={1000} close={close}>
          <ShortcutOverview />
        </OverlayBox>,
      })}
      <Main inert={inert} />
    </div>
  );
};


type OverlayBoxProps = React.PropsWithChildren<{
  close: () => void;
  maxWidth: number;
}>;

const OverlayBox: React.FC<OverlayBoxProps> = ({ close, children, maxWidth }) => {
  const isLight = useColorScheme().scheme === "light";
  const ref = useRef<HTMLDivElement>(null);
  useOnOutsideClick(ref, close);
  const bg = isLight ? COLORS.neutral05 : COLORS.neutral15;

  return (
    <div role="dialog" aria-modal="true" css={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: "32px 8px",
      zIndex: 800,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      "@media (min-height: 400px)": {
        paddingTop: "calc(var(--header-height) + 32px)",
      },
    }}>
      <div ref={ref} css={{
        position: "relative",
        backgroundColor: bg,
        borderRadius: 8,
        padding: 16,
        paddingLeft: 32,
        width: "82%",
        flex: "0 1 auto",
        minHeight: 0,
        maxWidth,
        boxShadow: "0 4px 16px var(--shadow-color))",
        [screenWidthAtMost(480)]: {
          width: "95%",
          padding: "12px 20px",
        },
      }}>
        <FiX
          onClick={close}
          css={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: bg,
            borderRadius: "50%",
            fontSize: 40,
            padding: 4,
            cursor: "pointer",
          }}
        />
        <div css={{
          height: "100%",
          overflowY: "auto",
          h1: {
            marginBottom: 8,
            fontSize: 26,
          },
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};
