//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Box, Flex } from '@theme-ui/components';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';

import useLocalStorage from './use-local-storage';
import initial from './default-settings';

import About from './ui/about';
import OpencastHeader from './ui/opencast-header';
import Settings from './ui/settings';
import Studio from './ui/studio';

const SETTINGS_KEY = 'ocStudioSettings';

function App({ defaultSettings = initial }) {
  const [settings, updateSettings] = useLocalStorage(SETTINGS_KEY, defaultSettings);

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
          <OpencastHeader />

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', '& > *': { flexGrow: 1 } }}>
            <Switch>
              <Route path="/settings" exact>
                <Settings
                  settings={settings}
                  handleUpdate={handleUpdate}
                />
              </Route>

              <Route path="/about" exact>
                <About />
              </Route>

              <ConnectedRoute path="/" exact settings={settings}>
                <Studio settings={settings} />
              </ConnectedRoute>

              <Route path="/*">
                <Redirect to="/" />
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
