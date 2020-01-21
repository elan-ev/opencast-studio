//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Container } from '@theme-ui/components';

import LanguagesSelect from './languages-select';
import Notification from './notification';
import OpencastAPI from '../opencast-api';
import SettingsForm from './settings-form';

function Settings(props) {
  const { t } = useTranslation();
  const [error, setError] = useState();
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/' } };

  function returnToTheStudio() {
    history.replace(from);
  }

  async function handleSubmit(data) {
    try {
      console.log("data:", data);
      const ocUploader = new OpencastAPI({ ...data, ...props.settingsManager.contextSettings });
      const connected = await ocUploader.checkConnection();
      if (!connected) {
        setError(t('upload-settings-validation-error'));
        return;
      }
      console.log(data);
      props.settingsManager.saveSettings({ opencast: data });
      returnToTheStudio();
    } catch (error) {
      setError(t('message-server-unreachable'));
      console.error(error);
    }
  }

  return (
    <Container>
      <header>
        <h1>{t('settings-header')}</h1>
      </header>

      <label sx={{ fontWeight: 'bold' }}>Language</label>
      <LanguagesSelect />

      <h2 sx={{ fontWeight: 'heading' }}>{t('upload-settings-modal-header')}</h2>
      <main>
        {error && <Notification isDanger>{error}</Notification>}

        {props.settingsManager.showFirstRunSetup() &&
          <Notification>{t('settings-first-run')}</Notification>}

        <SettingsForm
          settingsManager={props.settingsManager}
          handleSubmit={handleSubmit}
          handleCancel={returnToTheStudio}
        />
      </main>
    </Container>
  );
}

export default Settings;
