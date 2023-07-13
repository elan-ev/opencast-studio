import { Root } from "./layout";

import { ColorSchemeProvider } from "@opencast/appkit";
import { GlobalStyle } from "./ui/global-style";



export const App: React.FC = () => {
  return <>
    <GlobalStyle />
    <ColorSchemeProvider>
      <Root />
    </ColorSchemeProvider>
  </>;
};
