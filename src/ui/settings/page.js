//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { Box } from '@theme-ui/components';

import LanguageSettings from './language';
import OpencastSettings from './opencast';


const SettingsPage = ({ settingsManager }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { from } = location.state || { from: { pathname: '/' } };

  function returnToTheStudio() {
    history.replace(from);
  }

  return (
    <Box sx={{ width: 700, maxWidth: '100%', mx: 'auto', px: 3, pb: 3 }}>
      <header>
        <h1>{t('settings-header')}</h1>
      </header>

      <LanguageSettings />

      <OpencastSettings
        settingsManager={settingsManager}
        returnToTheStudio={returnToTheStudio}
      />

      <hr />
      <Link to="/">
        ← {t('settings-back')}
      </Link>
    </Box>
  );
};

export default SettingsPage;
