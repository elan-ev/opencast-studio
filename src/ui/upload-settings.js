//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@theme-ui/components';
import FormField from './form-field';
import Notification from './notification';
import OpencastAPI from '../opencast-api';

const Input = props => <input sx={{ width: '100%' }} {...props} />;

function UploadSettings(props) {
  const { t } = useTranslation();
  const [settings, updateSettings] = useState({ ...props.uploadSettings });
  const [error, setError] = useState();

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    updateSettings({ ...settings, [name]: value });
  }

  async function handleSubmit(event) {
    try {
      const ocUploader = new OpencastAPI({ ...settings });
      if (await ocUploader.checkConnection()) {
        props.updateUploadSettings(settings);
      } else {
        setError(t('upload-settings-validation-error'));
      }
    } catch (error) {
      setError(t('message-server-unreachable'));
      console.error(error);
    }
  }

  return (
    <div>
      <header>
        <h1 sx={{ fontWeight: 'heading' }}>{t('upload-settings-modal-header')}</h1>
      </header>

      <main>
        {error && <Notification isdanger="true">{error}</Notification>}

        <FormField label={t('upload-settings-label-server-url')}>
          <Input
            name="serverUrl"
            value={settings.serverUrl}
            onChange={handleInputChange}
            type="text"
            autoComplete="off"
          />
        </FormField>

        <FormField label={t('upload-settings-label-workflow-id')}>
          <Input
            name="workflowId"
            value={settings.workflowId}
            onChange={handleInputChange}
            type="text"
            autoComplete="off"
          />
        </FormField>

        <FormField label={t('upload-settings-label-username')}>
          <Input
            name="loginName"
            value={settings.loginName}
            onChange={handleInputChange}
            type="text"
            autoComplete="off"
          />
        </FormField>

        <FormField label={t('upload-settings-label-password')}>
          <Input
            name="loginPassword"
            value={settings.loginPassword}
            onChange={handleInputChange}
            type="password"
            autoComplete="off"
          />
        </FormField>
      </main>

      <footer sx={{mt: 4}}>
        <Button variant="primary" onClick={handleSubmit}>
          {t('upload-settings-button-validate')}
        </Button>
      </footer>
    </div>
  );
}

export default UploadSettings;
