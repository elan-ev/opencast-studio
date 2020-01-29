//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';

import LanguageSettings from './language';
import OpencastSettings from './opencast';


const SettingsPage = ({ settingsManager }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto', p: 3 }}>
      <header>
        <Styled.h1>{t('settings-header')}</Styled.h1>
      </header>

      <LanguageSettings />

      <OpencastSettings settingsManager={settingsManager} />
    </Box>
  );
};

export default SettingsPage;
