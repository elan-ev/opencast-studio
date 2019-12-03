//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from "theme-ui";
import { render } from '@testing-library/react';

import App from './App';
import theme from './theme';
import { SettingsManager } from './settings';


it('renders beta bubble', async () => {
  global.fetch = require('jest-fetch-mock');
  fetch.mockResponseOnce(JSON.stringify({}));

  const settingsManager = await SettingsManager.init();
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <App settingsManager={settingsManager} />
    </ThemeProvider>
  );
  expect(getByText('beta')).toBeInTheDocument();
});
