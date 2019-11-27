//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { lazy, Suspense } from 'react';
import { Global } from '@emotion/core';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import { ThemeProvider } from 'theme-ui';

import GlobalStyle from './style/global-style';
import theme from './theme';

import './i18n';
import * as serviceWorker from './serviceWorker';
import Loading from './loading';

if (process.env.NODE_ENV === 'production') {
    Sentry.init({ dsn: 'https://66e6b4dc3d59463fa34272abcb5da6b1@sentry.virtuos.uos.de/4' });
}

const App = lazy(() => import('./App'));

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Global styles={GlobalStyle} />
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
