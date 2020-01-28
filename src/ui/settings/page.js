//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Container } from '@theme-ui/components';

import LanguageSettings from './language';
import OpencastSettings from './opencast';


const SettingsPage = ({ settingsManager }) => {
  const { t } = useTranslation();

  return (
    <Container sx={{ p: 3 }}>
      <header>
        <Styled.h1>{t('settings-header')}</Styled.h1>
      </header>

      <LanguageSettings />

      <OpencastSettings settingsManager={settingsManager} />
    </Container>
  );
};

export default SettingsPage;
