//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';

import Notification from './notification';
import OpencastAPI from '../opencast-api';
import { navigate } from '../router';
import SettingsForm from './settings-form';

function Settings(props) {
  const { t } = useTranslation();
  const [error, setError] = useState();

  function returnToTheStudio() {
    // TODO: (mel) possibly replace this with navigate(-1)
    navigate('/');
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
        <h1 sx={{ fontWeight: 'heading' }}>{t('upload-settings-modal-header')}</h1>
      </header>

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
