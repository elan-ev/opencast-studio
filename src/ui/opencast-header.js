//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Link, useLocation } from 'react-router-dom';

import Navigation from './navigation';


function Brand() {
  const location = useLocation();

  return (
    <Link to={{ pathname: "/", search: location.search }}>
      <picture>
        <source
          media="(min-width: 920px)"
          srcSet={`${process.env.PUBLIC_URL}/opencast-studio.svg`}
        />
        <img
          src={`${process.env.PUBLIC_URL}/opencast-studio-small.svg`}
          alt="Opencast Studio"
          sx={{ height: 50 }}
        />
      </picture>
    </Link>
  );
}

function OpencastHeader() {
  return (
    <header
      sx={{
        height: theme => theme.heights.headerHeight,
        lineHeight: theme => theme.heights.headerHeight,
        color: 'background',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 3,
      }}
    >
      {/* This div is used just for the background color. We can't set it for
          the parent element, as the navigation overlay would otherwise occlude
          this background color */}
      <div sx={{
        backgroundColor: 'gray.0',
        position: 'absolute',
        zIndex: -3,
        height: '100%',
        width: '100%',
      }}></div>
      <Brand />

      <Navigation />
    </header>
  );
}

export default OpencastHeader;
