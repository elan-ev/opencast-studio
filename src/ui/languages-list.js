//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import Language from './languages-item.js';

function Languages({ className, languages, onSelectLanguage }) {
  return (
    <ul className={className}>
      {languages.map(language => (
        <Language language={language} key={language.short} onSelectLanguage={onSelectLanguage} />
      ))}
    </ul>
  );
}

const StyledLanguages = styled(Languages)`
  position: absolute;
  top: 100%;
  right: -0.5rem;
  padding-right: 0.5rem;
  z-index: 3;
  box-shadow: inset 0 3px 3px -3px rgba(0, 0, 0, 0.2), 0 3px 6px -2px rgba(0, 0, 0, 0.4);
  background: white;

  margin: 0;
  padding: 0;
  line-height: 2.5rem;
  list-style: none;
`;

export default StyledLanguages;
