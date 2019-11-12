//; -*- mode: rjsx;-*-
import React from 'react';
import { render } from '@testing-library/react';

import App from './App';

it('renders beta bubble', () => {
  const { getByText } = render(
      <App />
  );
  expect(getByText('beta')).toBeInTheDocument();
});
