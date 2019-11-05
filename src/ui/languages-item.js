//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Flag from './languages-flag';

function Language({ className, language, onSelectLanguage }) {
  return (
    <li
      onClick={onSelectLanguage.bind(null, language.short)}
      sx={{
        lineheight: '2rem',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        paddingLeft: '1rem',
        cursor: 'pointer'
      }}
    >
      <button
        type="button"
        value={language.short}
        sx={{ background: 'none', border: 'none', lineHeight: '2.5rem', verticalAlign: 'top' }}
      >
        {language.long}
      </button>
      <Flag
        data-attribution="Icon made by Freepik from www.flaticon.com"
        alt={language.long}
        src={language.flag}
        sx={{ margin: '0.25rem 0 0.25rem 0.5rem' }}
      />
    </li>
  );
}

export default Language;
