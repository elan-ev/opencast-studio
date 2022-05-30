//; -*- mode: rjsx;-*-
/** @jsx jsx */

import { jsx, useColorMode } from 'theme-ui';
import { Button } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

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
        {colorMode === 'dark' ? light : dark}
        <ThemeIcon/>
      </Button>
    </SettingsSection>
  );
};

const ThemeIcon = () => {
  const [colorMode] = useColorMode();

  return(
    <div
      sx={{
        color: '#ffd983',
        width: '10px',
        display: 'inline-block',
        ml: 2,
      }}
    >
    <FontAwesomeIcon icon={colorMode === 'dark' ? faSun : faMoon} />
    </div>
  )
};

export default ColorModeSettings;
