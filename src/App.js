//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Box, Flex } from '@theme-ui/components';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';

import { Provider } from './recording-context';

import About from './ui/about';
import OpencastHeader from './ui/opencast-header';
import Settings from './ui/settings';
import Studio from './ui/studio/page';


function App({ settingsManager }) {
  const [settings, updateSettings] = useState(settingsManager.settings());
  settingsManager.onChange = newSettings => updateSettings(newSettings);

  return (
    <Provider>
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
                <Settings settingsManager={settingsManager} />
              </Route>

              <Route path="/about" exact>
                <About />
              </Route>

              <Route path="/" exact>
                {
                  settingsManager.showFirstRunSetup()
                    ? <Redirect to={{ pathname: '/settings' }} />
                    : <Studio settings={settings} />
                }
              </Route>

              <Route path="/*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Box>
        </Flex>
      </Router>
    </Provider>
  );
}

App.propTypes = {
  defaultSettings: PropTypes.object
};


export default App;
