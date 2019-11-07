//; -*- mode: rjsx;-*-
import React from 'react';
import { render } from '@testing-library/react';

import { I18nextProvider } from 'react-i18next';
import i18next from './i18n/testing';

import App from './App';

it('renders beta bubble', () => {
  const { getByText } = render(
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  );
  expect(getByText('beta')).toBeInTheDocument();
});
