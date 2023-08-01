import { Root } from "./layout";

import { ColorSchemeProvider } from "@opencast/appkit";
import { GlobalStyle } from "./ui/global-style";
import { useStudioState } from "./studio-state";
import { useBeforeunload } from "react-beforeunload";



export const App: React.FC = () => {
  return <>
    <GlobalStyle />
    <PreventClose />
    <ColorSchemeProvider>
      <Root />
    </ColorSchemeProvider>
  </>;
};

/** Prevent closing the tab if recordings exists and they have not been saved. */
const PreventClose = () => {
  const { recordings, upload } = useStudioState();
  const downloaded = recordings.every(rec => rec.downloaded);
  const uploaded = upload.state === "uploaded";
  const uploading = upload.state === "uploading";

  useBeforeunload(event => {
    if ((recordings?.length > 0 && !uploaded && !downloaded) || uploading) {
      event.preventDefault();
    }
  });

  return null;
};

