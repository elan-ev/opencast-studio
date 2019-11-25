//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useState } from 'react';
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
    <div
      sx={{
        lineHeight: '2rem',
        mx: 3,
        position: 'relative'
      }}
    >
      <ChosenLanguage onClick={toggleVisible} language={chosenLang} />
      {isVisible ? <Languages languages={languages} onSelectLanguage={onSelectLanguage} /> : null}
    </div>
  );
}

export default LanguageChooser;
