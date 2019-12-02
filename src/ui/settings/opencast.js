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

  const fixedServerUrl = settingsManager.isFixed('opencast.serverUrl');
  const fixedWorkflowId = settingsManager.isFixed('opencast.workflowId');
  const fixedLoginName = settingsManager.isFixed('opencast.loginName');
  const fixedLoginPassword = settingsManager.isFixed('opencast.loginPassword');

  // If all settings are already specified by the context, we do not show
  // anything at all.
  if (fixedServerUrl && fixedWorkflowId && fixedLoginName && fixedLoginPassword) {
    return null;
  }

  return (
    <SettingsSection title={t('upload-settings-modal-header')}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        {error && <Notification isDanger>{error}</Notification>}

        <form onSubmit={handleSubmit(onSubmit)}>
          { !fixedServerUrl && <Input
            errors={errors}
            label={t('upload-settings-label-server-url')}
            name="serverUrl"
            register={register}
            required
          /> }

          { !fixedWorkflowId && <Input
            errors={errors}
            label={t('upload-settings-label-workflow-id')}
            name="workflowId"
            register={register}
            required
          /> }

          { !fixedLoginName && <Input
            errors={errors}
            label={t('upload-settings-label-username')}
            name="loginName"
            register={register}
            required
          /> }

          { !fixedLoginPassword && <Input
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
