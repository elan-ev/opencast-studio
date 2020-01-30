//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { cleanup, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import OpencastAPI from '../../opencast-api';
import SettingsPage from './page';
import { SettingsManager } from '../../settings';
import { Provider } from '../../recording-context';

import theme from '../../theme';
import { ThemeProvider } from 'theme-ui';


jest.mock('../../opencast-api');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  }),
  useLocation: jest.fn(() => ({}))
}));

beforeEach(() => {
  OpencastAPI.mockClear();
});
afterEach(cleanup);

it('renders empty form with no settings', async () => {
  const mockUpdate = jest.fn();

  const settingsManager = new SettingsManager();

  const { getByText, getByLabelText } = render(
    <Provider>
      <Router>
        <ThemeProvider theme={theme}>
          <SettingsPage settingsManager={settingsManager} handleUpdate={mockUpdate} />
        </ThemeProvider>
      </Router>
    </Provider>
  );

  expect(getByText('settings-header')).toBeInTheDocument();

  expect(getByText('Language')).toBeInTheDocument();

  expect(getByText('upload-settings-modal-header')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-server-url')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-workflow-id')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-username')).toBeInTheDocument();
  expect(getByLabelText('upload-settings-label-password')).toBeInTheDocument();
});

it('renders empty form with partial OC settings', async () => {
  const mockUpdate = jest.fn();

  const settingsManager = new SettingsManager({
    contextSettings: {
      opencast: {
        serverUrl: "https://localhost",
        loginName: "peter",
      }
    }
  });

  const { getByText, getByLabelText, queryByLabelText } = render(
    <Provider>
      <Router>
        <ThemeProvider theme={theme}>
          <SettingsPage settingsManager={settingsManager} handleUpdate={mockUpdate} />
        </ThemeProvider>
      </Router>
    </Provider>
  );

  expect(getByText('settings-header')).toBeInTheDocument();

  expect(getByText('Language')).toBeInTheDocument();

  expect(getByText('upload-settings-modal-header')).toBeInTheDocument();
  expect(queryByLabelText('upload-settings-label-server-url')).toBeNull();
  expect(getByLabelText('upload-settings-label-workflow-id')).toBeInTheDocument();
  expect(queryByLabelText('upload-settings-label-username')).toBeNull();
  expect(getByLabelText('upload-settings-label-password')).toBeInTheDocument();
});

it('renders empty form with full OC settings', async () => {
  const mockUpdate = jest.fn();

  const settingsManager = new SettingsManager({
    contextSettings: {
      opencast: {
            serverUrl: "https://localhost",
            workflowId: "any",
            loginName: "peter",
            loginPassword: "krokodil"
          }
    }
  });

  const { getByText, queryByLabelText, queryByText } = render(
    <Provider>
      <Router>
        <ThemeProvider theme={theme}>
          <SettingsPage settingsManager={settingsManager} handleUpdate={mockUpdate} />
        </ThemeProvider>
      </Router>
    </Provider>
  );

  expect(getByText('settings-header')).toBeInTheDocument();

  expect(getByText('Language')).toBeInTheDocument();

  expect(queryByText('upload-settings-modal-header')).toBeNull();
  expect(queryByLabelText('upload-settings-label-server-url')).toBeNull();
  expect(queryByLabelText('upload-settings-label-workflow-id')).toBeNull();
  expect(queryByLabelText('upload-settings-label-username')).toBeNull();
  expect(queryByLabelText('upload-settings-label-password')).toBeNull();
});
