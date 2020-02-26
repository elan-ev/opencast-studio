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
import { SettingsManager } from './settings';
import { Opencast } from './opencast';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://66e6b4dc3d59463fa34272abcb5da6b1@sentry.virtuos.uos.de/4' });
}

// Load the rest of the application and try to fetch the `settings.json`.
const initialize = Promise
  .all([
    import('./App').then(mod => mod.default),
    SettingsManager.init(),
  ])
  .then(async ([App, settingsManager]) => {
    console.log(settingsManager);
    const oc = await Opencast.init(settingsManager.settings().opencast);
    return [App, settingsManager, oc];
  })

const render = body => {
  ReactDOM.render(body, document.getElementById('root'));
};

// After the initialization is done, render to the root element.
initialize.then(
  ([App, settingsManager, opencast]) => {
    render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <Global styles={GlobalStyle} />
          <App settingsManager={settingsManager} />
        </ThemeProvider>
      </React.StrictMode>
     );
  },

  // This error case is vey unlikely to occur.
  e => render(<p>{`Fatal error while loading app: ${e.message}`}</p>),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
