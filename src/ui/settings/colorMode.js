//; -*- mode: rjsx;-*-
/** @jsx jsx */

import { jsx, useColorMode } from 'theme-ui';
import { Button } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';

import { SettingsSection } from './elements';

const ColorModeSettings = () => {
  const { t } = useTranslation();
  const [colorMode, setColorMode] = useColorMode();

  const dark = t('settings-theme-dark');
  const light = t('settings-theme-light');

  return (
    <SettingsSection title={t('settings-theme-appearance')}>
      <Button
        onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}>
        {colorMode === 'dark' ? light + ' ☀️' : dark + ' 🌙'}
      </Button>
    </SettingsSection>
  );
};

export default ColorModeSettings;