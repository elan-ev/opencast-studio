//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Themed } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';

import LanguageSettings from './language';
import OpencastSettings from './opencast';
import ColorModeSettings from './colorMode';


const SettingsPage = ({ settingsManager }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto', p: 3 }}>
      <header>
        <Themed.h1 sx={{ mb: '1.5em' }}>{t('settings-header')}</Themed.h1>
      </header>
      <div sx={{ display: 'flex', flexWrap: 'wrap', gap: '50px' }}>
        <OpencastSettings settingsManager={settingsManager} />
        <div sx={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
          <ColorModeSettings />
          <LanguageSettings />
        </div>
      </div>
    </Box>
  );
};

export default SettingsPage;
