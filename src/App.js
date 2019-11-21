//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Box, Flex } from '@theme-ui/components';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';

import languages from './languages';
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
      <Router basename={process.env.PUBLIC_URL || '/'}>
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

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', '& > *': { flexGrow: 1 } }}>
            <Switch>
              <Route path="/settings">
                <Settings settings={settings} handleUpdate={handleUpdate} />
              </Route>

              <Route path="/about">
                <About />
              </Route>

              <ConnectedRoute path="/" settings={settings}>
                <Studio settings={settings} />
              </ConnectedRoute>

              <Route path="*">
                <NotFound />
              </Route>
            </Switch>
          </Box>
        </Flex>
      </Router>
  );
}

App.propTypes = {
  defaultSettings: PropTypes.object
}

function ConnectedRoute({ children, settings, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        settings.connected ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/settings',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

ConnectedRoute.propTypes = {
  children: PropTypes.object,
  settings: PropTypes.object
}

export default App;
