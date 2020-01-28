//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from 'theme-ui';

import { Global } from '@emotion/core';
import * as Sentry from '@sentry/browser';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import GlobalStyle from './style/global-style';
import theme from './theme';

import './i18n';
import * as serviceWorker from './serviceWorker';
import Loading from './loading';
import { SettingsManager } from './settings';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://66e6b4dc3d59463fa34272abcb5da6b1@sentry.virtuos.uos.de/4' });
}

// This async function does all the heavy initialization of the app.
const init = () => {
  const module = import('./App').then(module => module.default);
  return Promise.all([module, SettingsManager.init()]);
};

// This component shows a loading screen until `init` is finished; then the main
// app is shown.
const LoadingApp = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setPending] = useState(true);

  useEffect(() => {
    init()
      .then(setData)
      .catch(setError)
      .finally(() => setPending(false));
  }, []);

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    return `Something went wrong: ${error.message}`;
  }

  let [App, settingsManager] = data;
  return <App settingsManager={settingsManager} />;
};

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Global styles={GlobalStyle} />
      <LoadingApp />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
