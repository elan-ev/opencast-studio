//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import LanguagesChooser from './languages-chooser';
import { Link } from 'react-router-dom';

const BetaBubble = props => (
  <span
    sx={{
      position: 'relative',
      top: '4px',
      fontSize: '12pt',
      verticalAlign: 'top',
      display: ['none', 'inline'],
      border: '1px solid #888',
      borderRadius: '5px',
      padding: '2px',
      color: '#aaa'
    }}
    {...props}
  />
);

function Brand() {
  return (
    <span>
      <Link to="/">
        <picture>
          <source
            media="(min-width: 769px)"
            srcSet={`${process.env.PUBLIC_URL}/opencast-studio.svg`}
          />
          <img
            src={`${process.env.PUBLIC_URL}/opencast-studio-small.svg`}
            alt="Opencast Studio"
            sx={{ height: 50 }}
          />
        </picture>
      </Link>

      <BetaBubble>beta</BetaBubble>
    </span>
  );
}

function OpencastHeader(props) {
  return (
    <header
      sx={{
        height: '3rem',
        lineHeight: '3rem',
        background: '#333',
        color: 'background',
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <Brand />

      <LanguagesChooser
        languages={props.languages}
        chosenLanguage={props.chosenLanguage}
        onSelectLanguage={props.onSelectLanguage}
      />
    </header>
  );
}

export default OpencastHeader;
