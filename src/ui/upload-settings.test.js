//; -*- mode: rjsx;-*-
import React from 'react';
import { act, cleanup, fireEvent, render, waitForElement } from '@testing-library/react';
import axiosMock from 'axios';

import UploadSettings from './upload-settings';

afterEach(cleanup);

it('renders empty form w/o upload settings', () => {
  const { getByText, getByLabelText } = render(<UploadSettings />);

  expect(getByText('upload-settings-modal-header')).toBeInTheDocument();

  expect(getByLabelText('upload-settings-label-server-url')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-server-url')).toHaveValue('');

  expect(getByLabelText('upload-settings-label-workflow-id')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-workflow-id')).toHaveValue('');

  expect(getByLabelText('upload-settings-label-username')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-username')).toHaveValue('');

  expect(getByLabelText('upload-settings-label-password')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-password')).toHaveValue('');
});

// TODO: (mel) refactor the opencast api JS for real testing
it('renders error on wrong settings', () => {
  // axiosMock.mockResolvedValue({ data: { greeting: 'hello there' } });

  const settings = {
    serverUrl: 'some',
    workflowId: 'very',
    loginName: 'wrong',
    loginPassword: 'settings'
  };

  const { getByRole, getByText } = render(
    <UploadSettings uploadSettings={settings} updateUploadSettings={() => {}} />
  );

  act(() => {
    getByRole('button').click();
  });

  // expect(getByText('upload-settings-button-validate')).toBeInTheDocument();
  // expect(getByText('upload-settings-validation-error')).toBeInTheDocument();
});

it('renders form w/ upload settings', () => {
  const settings = {
    serverUrl: 'https://localhost',
    workflowId: 'any',
    loginName: 'user',
    loginPassword: 'password'
  };

  const { getByText, getByLabelText } = render(<UploadSettings uploadSettings={settings} />);

  expect(getByText('upload-settings-modal-header')).toBeInTheDocument();

  expect(getByLabelText('upload-settings-label-server-url')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-server-url')).toHaveValue(settings.serverUrl);

  expect(getByLabelText('upload-settings-label-workflow-id')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-workflow-id')).toHaveValue(settings.workflowId);

  expect(getByLabelText('upload-settings-label-username')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-username')).toHaveValue(settings.loginName);

  expect(getByLabelText('upload-settings-label-password')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-password')).toHaveValue(settings.loginPassword);
});
