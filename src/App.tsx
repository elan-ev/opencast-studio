import { Root } from "./layout";

import { Provider as StudioStateProvier } from "./studio-state";
import { ColorSchemeProvider } from "@opencast/appkit";
import { GlobalStyle } from "./ui/global-style";



type Props = {
  userHasWebcam: boolean;
};

export const App: React.FC<Props> = () => {
  return <>
    <GlobalStyle />
    <StudioStateProvier>
      <ColorSchemeProvider>
        <Root />
      </ColorSchemeProvider>
    </StudioStateProvier>
  </>;
};
