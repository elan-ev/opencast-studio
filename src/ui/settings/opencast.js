//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleNotch, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import useForm from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Box, Button } from '@theme-ui/components';

import { useState } from 'react';

import OpencastAPI from '../../opencast-api';
import Notification from '../notification';
import { Input, SettingsSection} from './elements';
import { useRecordingState } from '../../recording-context';



function OpencastSettings({ settingsManager }) {
  const { t } = useTranslation();
  const [error, setError] = useState();
  const { errors, handleSubmit, register } = useForm({
    defaultValues: settingsManager.formValues().opencast
  });
  const [status, setStatus] = useState('initial');

  const { recordings } = useRecordingState();
  const hasRecording = recordings.length > 0;

  async function onSubmit(data) {
    try {
      setStatus('testing');
      const ocUploader = new OpencastAPI({
        ...settingsManager.settings().opencast,
        ...data,
      });
      const connected = await ocUploader.checkConnection();
      if (!connected) {
        setStatus('error');
        setError(t('upload-settings-validation-error'));
        return;
      }
      settingsManager.saveSettings({ opencast: data });
      setStatus('saved');
      setError(null)
    } catch (error) {
      setStatus('error');
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

  const icons = {
    testing: faCircleNotch,
    error: faExclamationCircle,
    saved: faCheckCircle,
  };
  const icon = icons[status];

  return (
    <SettingsSection title={t('upload-settings-modal-header')}>
      <Box>
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
            <Button sx={{ verticalAlign: 'middle' }}>
              {t('upload-settings-button-store')}
            </Button>
            { icon && <FontAwesomeIcon
              icon={icon}
              sx={{ ml: '10px', fontSize: '30px', verticalAlign: 'middle' }}
              spin={status === 'testing'}
            /> }
            { hasRecording && status === 'saved' && (
              <Link to="/" sx={{ ml: 3, variant: 'styles.a' }}>
                {t('settings-back-to-recording')}
              </Link>
            )}
          </footer>
        </form>
      </Box>
    </SettingsSection>
  );
}

export default OpencastSettings;
