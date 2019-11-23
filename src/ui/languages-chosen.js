//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

function ChosenLanguage({ onClick, language }) {
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
    </label>
  );
}

export default ChosenLanguage;
