//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';


import { Global } from '@emotion/core';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import { ThemeProvider } from 'theme-ui';
import { useAsync } from "react-async"

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
const init = async () => {
  const module = import('./App').then(module => module.default);
  return Promise.all([module, SettingsManager.init()]);
}

// This component shows a loading screen until `init` is finished; then the main
// app is shown.
const LoadingApp = () => {
  const { data, error, isPending } = useAsync({ promiseFn: init });

  if (isPending) {
    return <Loading />;
  }

  if (error) {
    // TODO: not sure what to do here
    return `Something went wrong: ${error.message}`
  }

  let [App, settingsManager] = data;
  return <App settingsManager={settingsManager} />;
};

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Global styles={GlobalStyle} />
  <LoadingApp />
  </ThemeProvider>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
