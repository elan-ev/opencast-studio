//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from "theme-ui";
import { render } from '@testing-library/react';

import App from './App';
import defaultSettings from './default-settings';

it('renders beta bubble', () => {
  const { getByText } = render(<App defaultSettings={{ ...defaultSettings, connected: true }} />);
  expect(getByText('beta')).toBeInTheDocument();
});
