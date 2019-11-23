//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Language from './languages-item.js';

function Languages({ languages, onSelectLanguage }) {
  return (
    <ul
      sx={{
        position: 'absolute',
        top: '100%',
        right: '-0.5rem',
        paddingRight: '0.5rem',
        zIndex: '3',
        boxShadow: 'inset 0 3px 3px -3px rgba(0, 0, 0, 0.2), 0 3px 6px -2px rgba(0, 0, 0, 0.4)',
        background: 'white',
        margin: '0',
        padding: '0',
        listStyle: 'none'
      }}
    >
      {languages.map(language => (
        <Language language={language} key={language.short} onSelectLanguage={onSelectLanguage} />
      ))}
    </ul>
  );
}

export default Languages;
