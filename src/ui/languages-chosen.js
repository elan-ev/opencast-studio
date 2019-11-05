//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Flag from './languages-flag';

function ChosenLanguage({ onClick, className, language }) {
  return (
    <label onClick={onClick} sx={{ lineHeight: '3rem', height: '3rem', display: 'inlineBlock' }}>
      <span
        sx={{
          lineHeight: '3rem',
          verticalAlign: 'top',
          textTransform: 'uppercase'
        }}
      >
        {language.short}
      </span>
      <Flag alt="language.long" src={language.flag} />
    </label>
  );
}

export default ChosenLanguage;
