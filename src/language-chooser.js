import React, { useState } from "react";
import styled from "styled-components/macro";

const Wrapper = styled.div`
  float: right;
  line-height: 3rem;
  height: 3rem;
  margin: 0 1rem;
  position: relative;
`;

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
    font-family: Ubuntu, Roboto, "Open Sans", "Segoe UI", "Helvetica Neue",
      Verdana, sans-serif;
    line-height: 3rem;
    vertical-align: top;
    text-transform: uppercase;
  }
`;

const Flag = styled.img`
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0 0.5rem 0.5rem;
  vertical-align: top;
  display: inline-block;
`;

function Language({ className, language, onSelectLanguage }) {
  return (
    <li className={className} onClick={() => onSelectLanguage(language.short)}>
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

function Languages({ className, languages, onSelectLanguage }) {
  return (
    <ul className={className}>
      {languages.map(language => (
        <StyledLanguage
          language={language}
          key={language.short}
          onSelectLanguage={onSelectLanguage}
        />
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
  box-shadow: inset 0 3px 3px -3px rgba(0, 0, 0, 0.2),
    0 3px 6px -2px rgba(0, 0, 0, 0.4);
  background: white;

  /* TODO are these general styles */
  margin: 0;
  padding: 0;
  line-height: 2.5rem;
  list-style: none;
`;

function LanguageChooser({
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
    <Wrapper>
      <StyledChosenLanguage onClick={toggleVisible} language={chosenLang} />
      {isVisible ? (
        <StyledLanguages
          languages={languages}
          onSelectLanguage={onSelectLanguage}
        />
      ) : null}
    </Wrapper>
  );
}

export default LanguageChooser;
