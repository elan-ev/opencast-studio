//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

import Notification from '../notification';

import LanguageSettings from './language';
import OpencastSettings from './opencast';
import { SettingsSection } from './elements';

function SettingsPage(props) {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/' } };

  function returnToTheStudio() {
    history.replace(from);
  }

  return (
    <main sx={{ maxWidth: 960, mx: 'auto', px: 3, pb: 3 }}>
      <header>
        <h1>{t('settings-header')}</h1>
      </header>

      <SettingsSection title="Language">
        <LanguageSettings />
      </SettingsSection>

      <SettingsSection title={t('upload-settings-modal-header')}>
        {props.settingsManager.showFirstRunSetup() &&
          <Notification>{t('settings-first-run')}</Notification>}

        <OpencastSettings
          settingsManager={props.settingsManager}
          returnToTheStudio={returnToTheStudio}
        />
      </SettingsSection>
    </main>
  );
}

export default SettingsPage;
