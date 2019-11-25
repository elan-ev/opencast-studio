//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

const LanguagesSelect = ({ languages, chosenLanguage, onSelectLanguage }) => (
  <select sx={{ width: '100%' }}>
    {languages.map(language => (
      <option
        onClick={onSelectLanguage.bind(null, language.short)}
        value={language.short}
        selected={language.short === chosenLanguage}
      >
        {language.long}
      </option>
    ))}
  </select>
);

export default LanguagesSelect;
