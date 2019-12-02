//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import useForm from 'react-hook-form';
import { Box, Button } from '@theme-ui/components';

import { useState } from 'react';

import OpencastAPI from '../../opencast-api';
import Notification from '../notification';
import { Input, SettingsSection} from './elements';



function OpencastSettings({ settingsManager, returnToTheStudio }) {
  const { t } = useTranslation();
  const [error, setError] = useState();
  const { errors, handleSubmit, register } = useForm({
    defaultValues: settingsManager.formValues().opencast
  });

  async function onSubmit(data) {
    try {
      const ocUploader = new OpencastAPI({ ...data, ...settingsManager.contextSettings });
      const connected = await ocUploader.checkConnection();
      if (!connected) {
        setError(t('upload-settings-validation-error'));
        return;
      }
      console.log(data);
      settingsManager.saveSettings({ opencast: data });
      returnToTheStudio();
    } catch (error) {
      setError(t('message-server-unreachable'));
      console.log(error);
    }
  }


  const contextSettings = settingsManager.contextSettings.opencast || {};

  // If all settings are already specified by the context, we do not show
  // anything at all.
  if (
    contextSettings.serverUrl &&
    contextSettings.workflowId &&
    contextSettings.loginName &&
    contextSettings.loginPassword
  ) {
    return null;
  }

  return (
    <SettingsSection title={t('upload-settings-modal-header')}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        {error && <Notification isDanger>{error}</Notification>}

        <form onSubmit={handleSubmit(onSubmit)}>
          { !contextSettings.serverUrl && <Input
            errors={errors}
            label={t('upload-settings-label-server-url')}
            name="serverUrl"
            register={register}
            required
          /> }

          { !contextSettings.workflowId && <Input
            errors={errors}
            label={t('upload-settings-label-workflow-id')}
            name="workflowId"
            register={register}
            required
          /> }

          { !contextSettings.loginName && <Input
            errors={errors}
            label={t('upload-settings-label-username')}
            name="loginName"
            register={register}
            required
          /> }

          { !contextSettings.loginPassword && <Input
            errors={errors}
            label={t('upload-settings-label-password')}
            name="loginPassword"
            register={register}
            required
            type="password"
          /> }

          <footer sx={{ mt: 4 }}>
            <Button>{t('upload-settings-button-store')}</Button>
          </footer>
        </form>
      </Box>
    </SettingsSection>
  );
}

export default OpencastSettings;
