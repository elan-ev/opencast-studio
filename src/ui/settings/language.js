//; -*- mode: rjsx;-*-
/** @jsx jsx */

import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';

import languages from '../../languages';
import { SettingsSection } from './elements';

const LanguageSettings = () => {
  const { i18n } = useTranslation();

  return (
    <SettingsSection title="Language">
      <select
        sx={{ variant: 'styles.select' }}
        defaultValue={i18n.language}
        onChange={e => i18n.changeLanguage(e.target.value)}
      >
        {languages.map(language => (
          <option value={language.short} key={language.short}>
            {language.long}
          </option>
        ))}
      </select>
    </SettingsSection>
  );
};

export default LanguageSettings;
