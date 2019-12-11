//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Link } from 'react-router-dom';

import Navigation from './navigation';

const BetaBubble = props => (
  <span
    sx={{
      position: 'relative',
      top: '4px',
      fontSize: '12pt',
      verticalAlign: 'top',
      display: ['none', 'inline'],
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray.2',
      borderRadius: 5,
      padding: '2px',
      color: 'gray.2'
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

function OpencastHeader() {
  return (
    <header
      sx={{
        height: theme => theme.heights.headerHeight,
        lineHeight: theme => theme.heights.headerHeight,
        backgroundColor: 'gray.0',
        color: 'background',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 3,
      }}
    >
      <Brand />

      <Navigation />
    </header>
  );
}

export default OpencastHeader;
