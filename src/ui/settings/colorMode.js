//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, useColorMode } from 'theme-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsSection } from './elements';

const ColorModeSettings = () => {
  const { t } = useTranslation();
  const [, setColorMode] = useColorMode();

  const getSystemPreference = () => {
    const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
    if(isDarkPrefered.matches) {
      setColorMode('dark');
    }
    else {
      setColorMode('light');
    }
  }

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if(theme === 'systemTheme') {
      getSystemPreference();
    }
  })

  const switchTheme = (value) => {
    localStorage.removeItem('prefers-color-scheme')
    if(value === 'systemTheme') {
      getSystemPreference();
      localStorage.setItem('theme', 'systemTheme')
    }
    else if(value === 'darkTheme') {
      setColorMode('dark');
      localStorage.setItem('theme', 'darkTheme')
    }
    else {
      setColorMode('light');
      localStorage.setItem('theme', 'lightTheme')
    }
  }

  const themes = [
    { value: 'systemTheme', label: 'System Design' },
    { value: 'lightTheme', label: t('settings-theme-light') },
    { value: 'darkTheme', label: t('settings-theme-dark') }
  ]

  return (
    <SettingsSection title={t('settings-theme-appearance')}>
      <select
        sx={{ variant: 'styles.select' }}
        defaultValue={localStorage.getItem('theme')}
        onChange={themes => switchTheme(themes.target.value)} 
      >
        {themes.map((option, index) => (
          <option key={index} value={option.value}>{option.label}</option>
        ))}
      </select> 
    </SettingsSection>
  );
};

export default ColorModeSettings;
