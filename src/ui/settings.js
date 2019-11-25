//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { Box } from '@theme-ui/components';

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
      const ocUploader = new OpencastAPI({ ...data });
      const connected = await ocUploader.checkConnection();
      if (!connected) {
        setError(t('upload-settings-validation-error'));
        return;
      }
      props.handleUpdate(data);
      returnToTheStudio();
    } catch (error) {
      setError(t('message-server-unreachable'));
      console.log(error);
    }
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, pb: 3 }}>
      <header>
        <h1>{t('settings-header')}</h1>
      </header>

      <label sx={{ fontWeight: 'bold' }}>Language: </label>
      <LanguagesSelect />

      <h2 sx={{ fontWeight: 'heading' }}>{t('upload-settings-modal-header')}</h2>
      <main>
        {error && <Notification isDanger>{error}</Notification>}

        {!props.settings.connected && <Notification>{t('settings-first-run')}</Notification>}

        <SettingsForm
          settings={props.settings}
          handleSubmit={handleSubmit}
          handleCancel={returnToTheStudio}
        />
      </main>
    </Box>
  );
}

export default Settings;
