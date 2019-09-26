//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import Flag from './languages-flag';

function Language({ className, language, onSelectLanguage }) {
  return (
      <li className={className} onClick={onSelectLanguage.bind(null, language.short)}>
      <button type="button" value={language.short}>
        {language.long}
      </button>
      <Flag
        data-attribution="Icon made by Freepik from www.flaticon.com"
        alt={language.long}
        src={language.flag}
      />
    </li>
  );
}

const StyledLanguage = styled(Language)`
  line-height: 2rem;
  text-align: right;
  white-space: nowrap;
  padding-left: 1rem;
  cursor: pointer;

  button {
    background: none;
    border: none;
    line-height: 2.5rem;
    vertical-align: top;
  }

  img {
    margin: 0.25rem 0 0.25rem 0.5rem;
  }
`;

export default StyledLanguage;
