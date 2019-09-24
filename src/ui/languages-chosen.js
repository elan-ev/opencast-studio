//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import Flag from './languages-flag';

function ChosenLanguage({ onClick, className, language }) {
  return (
    <label className={className} onClick={onClick}>
      <span>{language.short}</span>
      <Flag alt="language.long" src={language.flag} />
    </label>
  );
}

const StyledChosenLanguage = styled(ChosenLanguage)`
  line-height: 3rem;
  height: 3rem;
  display: inline-block;

  > span {
    line-height: 3rem;
    vertical-align: top;
    text-transform: uppercase;
  }
`;

export default StyledChosenLanguage;
