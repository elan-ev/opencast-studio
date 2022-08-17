//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Flex } from '@theme-ui/components';
import { useState, Fragment } from 'react';
import { BrowserRouter as Router, Switch, Redirect, Route, useLocation } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';
import { Global } from '@emotion/core';
import { useSettings } from './settings';

import { Provider, useStudioState, STATE_UPLOADED, STATE_UPLOADING } from './studio-state';

import About from './ui/about';
import Header from './ui/header';
import Studio from './ui/studio/page';
import SettingsPage from './ui/settings/page';
import Warnings from './ui/warnings';
import KeyboardShortcuts from './ui/studio/keyboard-shortcuts/shortcuts';

function App({ settingsManager, userHasWebcam }) {
  const settings = useSettings();

  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      <Global styles={settings.theme?.customCSS || ''}/>
      <Provider>
        <Flex sx={{ flexDirection: 'column', height: '100%' }}>
          <Header />
          <main sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '285px' }}>
            <Warnings />
            <Routes settingsManager={settingsManager} userHasWebcam={userHasWebcam} />
          </main>
        </Flex>
      </Provider>
    </Router>
  );
}

const Routes = ({ settingsManager, userHasWebcam }) => {
  const [activeStep, updateActiveStep] = useState(0);
  const location = useLocation();

  return (
    <Fragment>
      <PreventClose />
      <Switch>
        <Route path="/settings" exact>
          <SettingsPage settingsManager={settingsManager} />
        </Route>
        <Route path="/shortcuts" exact>
          <KeyboardShortcuts />
        </Route>
        <Route path="/about" exact>
          <About />
        </Route>
        <Route path="/" exact>
          <Studio
            activeStep={activeStep}
            updateActiveStep={updateActiveStep}
            userHasWebcam={userHasWebcam}
          />
        </Route>

        <Route path="/*">
          <Redirect to={{ pathname: "/", search: location.search }} />
        </Route>
      </Switch>
    </Fragment>
  );
};

const PreventClose = () => {
  const { recordings, upload } = useStudioState();
  const downloaded = recordings.every(rec => rec.downloaded);
  const uploaded = upload.state === STATE_UPLOADED;
  const uploading = upload.state === STATE_UPLOADING;

  const handler = event => {
    if ((recordings?.length > 0 && !uploaded && !downloaded) || uploading) {
      event.preventDefault();
    }
  };

  return <Beforeunload onBeforeunload={handler} />;
};


export default App;
