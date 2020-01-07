//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from "theme-ui";
import { render } from '@testing-library/react';

import App from './App';
import defaultSettings from './default-settings';
import theme from './theme';

it('renders beta bubble', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <App defaultSettings={{ ...defaultSettings, connected: true }} />
    </ThemeProvider>
  );
  expect(getByText('beta')).toBeInTheDocument();
});
