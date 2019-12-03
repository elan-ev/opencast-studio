//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Flex } from '@theme-ui/components';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';

import { Provider } from './recording-context';

import About from './ui/about';
import OpencastHeader from './ui/opencast-header';
import Studio from './ui/studio/page';
import SettingsPage from './ui/settings/page';
import Warnings from './ui/warnings';


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

          <main sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            '& > *:not(:first-of-type)': { flexGrow: 1 }
          }}>
            <Warnings settings={settings} />

            <Switch>
              <Route path="/settings" exact>
                <SettingsPage settingsManager={settingsManager} />
              </Route>

              <Route path="/about" exact>
                <About />
              </Route>

              <Route path="/" exact>
                <Studio settings={settings} />
              </Route>

              <Route path="/*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </main>
        </Flex>
      </Router>
    </Provider>
  );
}

App.propTypes = {
  defaultSettings: PropTypes.object
};


export default App;
