//; -*- mode: rjsx;-*-
/** @jsx jsx */

import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';

import languages from '../../i18n/languages';
import { SettingsSection } from './elements';

const LanguageSettings = () => {
  const { i18n, t } = useTranslation();
  // Keep the 2nd "Language" string untranslated
  // (If Studio is set to some weird language, you still want to find the language section)
  var lang_label = t('settings-language-label');
  if (lang_label !== 'Language') {
    lang_label += ' / Language';
  }
  return (
    <SettingsSection title={t('settings-general-header')}>
      <label
        htmlFor="studio-lang"
        sx={{ variant: 'styles.label' }}
      >
        {lang_label}
      </label>
      <select
        id="studio-lang"
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
