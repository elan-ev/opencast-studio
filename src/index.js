//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from 'theme-ui';

import { Global } from '@emotion/core';
import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom';

import GlobalStyle from './style/global-style';
import theme from './theme';

import './i18n';
import * as serviceWorker from './serviceWorker';
import { SettingsManager, Provider as SettingsProvider } from './settings';
import { Opencast, Provider as OpencastProvider } from './opencast';
import { userHasWebcam } from './util';

if (process.env.REACT_APP_ENABLE_SENTRY === '1') {
  Sentry.init({ dsn: 'https://66e6b4dc3d59463fa34272abcb5da6b1@sentry.virtuos.uos.de/4' });
}

// Load the rest of the application and try to fetch the `settings.json`.
const initialize = Promise.all([
  // Load rest of the application code
  import('./App').then(mod => mod.default),

  // Check for camera devices
  userHasWebcam(),

  // Load the settings and initialize Opencast
  SettingsManager.init().then(async settingsManager => {
    const oc = await Opencast.init(settingsManager.settings().opencast);
    return [settingsManager, oc];
  }),
]);

const render = body => {
  ReactDOM.render(body, document.getElementById('root'));
};

// After the initialization is done, render to the root element.
initialize.then(
  ([App, userHasWebcam, [settingsManager, opencast]]) => {
    render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <Global styles={GlobalStyle} />
          <OpencastProvider initial={opencast}>
            <SettingsProvider settingsManager={settingsManager}>
              <App settingsManager={settingsManager} userHasWebcam={userHasWebcam} />
            </SettingsProvider>
          </OpencastProvider>
        </ThemeProvider>
      </React.StrictMode>
     );
  },

  // This error case is vey unlikely to occur.
  e => render(<p>
    {`Fatal error while loading app: ${e.message}`}
    <br />
    This might be caused by a incorrect configuration by the system administrator.
  </p>),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
