//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Flex } from '@theme-ui/components';
import { useState } from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';

import { Provider, useRecordingState } from './recording-context';

import About from './ui/about';
import OpencastHeader from './ui/opencast-header';
import Studio from './ui/studio/page';
import SettingsPage from './ui/settings/page';
import Warnings from './ui/warnings';


function App({ settingsManager }) {
  const [settings, updateSettings] = useState(settingsManager.settings());
  settingsManager.onChange = newSettings => updateSettings(newSettings);

  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      <Flex sx={{ flexDirection: 'column', height: '100%' }}>
        <OpencastHeader />

        <main sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '285px' }}>
          <Warnings settings={settings} />
          <Routes settingsManager={settingsManager} settings={settings} />
        </main>
      </Flex>
    </Router>
  );
}

const Routes = ({ settings, settingsManager }) => {
  const [activeStep, updateActiveStep] = useState(0);

  return (
    <Provider>
      <PreventClose />
      <Switch>
        <Route path="/settings" exact>
          <SettingsPage settingsManager={settingsManager} />
        </Route>

        <Route path="/about" exact>
          <About />
        </Route>

        <Route path="/" exact>
          <Studio
            settings={settings}
            activeStep={activeStep}
            updateActiveStep={updateActiveStep}
          />
        </Route>

        <Route path="/*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Provider>
  );
};

const PreventClose = () => {
  const { recordings } = useRecordingState();
  const handler = event => {
    if (recordings?.length > 0) {
      event.preventDefault();
    }
  };

  return <Beforeunload onBeforeunload={handler} />;
};


export default App;
