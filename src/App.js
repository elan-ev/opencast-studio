//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from 'theme-ui';
import { Flex } from '@theme-ui/components';

import { Global } from '@emotion/core';
import { Redirect, Router } from '@reach/router';
import { useTranslation } from 'react-i18next';

import languages from './languages';
import GlobalStyle from './style/global-style';
import theme from './theme';
import useLocalStorage from './use-local-storage';
import initial from './default-settings';

import About from './ui/about';
import NotFound from './ui/not-found';
import OpencastHeader from './ui/opencast-header';
import Settings from './ui/settings';
import Studio from './ui/studio';

const SETTINGS_KEY = 'ocStudioSettings';

function App({ defaultSettings = initial }) {
  const { i18n } = useTranslation();

  const [settings, updateSettings] = useLocalStorage(SETTINGS_KEY, defaultSettings);

  const selectLanguage = language => {
    updateSettings(prevState => ({ ...prevState, language }));
    i18n.changeLanguage(language);
  };

  const handleUpdate = data => {
    updateSettings(prevState => ({ ...prevState, ...data, connected: true }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Global styles={GlobalStyle} />

      <Flex
        sx={{
          flexDirection: 'column',
          minHeight: '100%'
        }}
      >
        <OpencastHeader
          languages={languages}
          chosenLanguage={settings.language}
          onSelectLanguage={selectLanguage}
        />

        <Router
          basepath={process.env.PUBLIC_URL}
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', '& > *': { flexGrow: 1 } }}
        >
          {!settings.connected && (
            <Redirect
              from={`${process.env.PUBLIC_URL}/`}
              to={`${process.env.PUBLIC_URL}/settings`}
            />
          )}

          <Studio path="/" settings={settings} />
          <Settings path="/settings" settings={settings} handleUpdate={handleUpdate} />
          <About path="/about" />
          <NotFound default />
        </Router>
      </Flex>
    </ThemeProvider>
  );
}

export default App;
