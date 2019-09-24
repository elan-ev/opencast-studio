//; -*- mode: rjsx;-*-
import React, { useState } from 'react';
import styled from 'styled-components/macro';
import ChosenLanguage from './languages-chosen';
import Languages from './languages-list';

function LanguageChooser({
  className,
  languages,
  chosenLanguage,
  onSelectLanguage: selectLanguage
}) {
  const [isVisible, setVisible] = useState(false);
  const toggleVisible = () => {
    setVisible(!isVisible);
  };

  const chosenLang = languages.find(({ short }) => short === chosenLanguage);

  const onSelectLanguage = language => {
    setVisible(false);
    selectLanguage(language);
  };

  return (
    <div className={className}>
      <ChosenLanguage onClick={toggleVisible} language={chosenLang} />
      {isVisible ? <Languages languages={languages} onSelectLanguage={onSelectLanguage} /> : null}
    </div>
  );
}

const StyledLanguageChooser = styled(LanguageChooser)`
  float: right;
  line-height: 3rem;
  height: 3rem;
  margin: 0 1rem;
  position: relative;
`;

export default StyledLanguageChooser;
