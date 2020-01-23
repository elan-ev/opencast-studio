//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from "theme-ui";
import { render } from '@testing-library/react';

import App from './App';
import theme from './theme';
import { SettingsManager } from './settings';


it('renders beta bubble', () => {
  const settingsManager = new SettingsManager();
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <App settingsManager={settingsManager} />
    </ThemeProvider>
  );
  expect(getByText('beta')).toBeInTheDocument();
});
