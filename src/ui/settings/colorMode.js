//; -*- mode: rjsx;-*-
/** @jsx jsx */

import { jsx, useColorMode } from 'theme-ui';
import { useTranslation } from 'react-i18next';

import { SettingsSection } from './elements';

const ColorModeSettings = () => {
  const { t } = useTranslation();
  const [colorMode, setColorMode] = useColorMode();

  const darkmode = t('settings-theme-dark');
  const lightmode = t('settings-theme-light');

  return (
    <SettingsSection title={t('settings-theme-appearance')}>
      <select
        sx={{ variant: 'styles.select' }}
        value={colorMode}
        onChange={e => setColorMode(e.target.value)}
      >
        <option value='light'>{lightmode}</option>
        <option value='dark'>{darkmode}</option>
      </select> 
    </SettingsSection>
  );
};

export default ColorModeSettings;
