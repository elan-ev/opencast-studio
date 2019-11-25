//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

function Language({ language, onSelectLanguage }) {
  return (
    <li
      onClick={onSelectLanguage.bind(null, language.short)}
      sx={{
        whiteSpace: 'nowrap',
        padding: '0 1rem',
        cursor: 'pointer'
      }}
    >
      <button
        type="button"
        value={language.short}
        sx={{ background: 'none', border: 'none' }}
      >
        {language.long}
      </button>
    </li>
  );
}

export default Language;
