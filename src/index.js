//; -*- mode: rjsx;-*-
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';

import './i18n';
import * as serviceWorker from './serviceWorker';
import Loading from './loading';

Sentry.init({ dsn: 'https://66e6b4dc3d59463fa34272abcb5da6b1@sentry.virtuos.uos.de/4' });

const App = lazy(() => import('./App'));

ReactDOM.render(
  <Suspense fallback={<Loading />}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Suspense>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
