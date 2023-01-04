//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, useColorMode } from 'theme-ui';

import { Link, NavLink, useLocation } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faTimes,
  faWrench,
  faInfoCircle,
  faVideo,
  faKeyboard,
} from "@fortawesome/free-solid-svg-icons";

import { useStudioState } from '../studio-state';


// The header, including a logo on the left and the navigation on the right.
export default function Header() {
  const { isRecording } = useStudioState();
  const [ colorMode ] = useColorMode();

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
        backgroundColor: colorMode === 'dark' ? 'gray.4' : 'gray.0',
        position: 'absolute',
        zIndex: -3,
        height: '100%',
        width: '100%',
      }}></div>

      {/* This div is an overlay that is shown when a recording is currently active.
          This prevents the user from visiting other pages while recording. */}
      { isRecording && <div sx={{
        backgroundColor: colorMode === 'dark' ? 'gray.4' : 'gray.0',
        position: 'absolute',
        zIndex: 20,
        height: '100%',
        width: '100%',
        opacity: 0.75,
      }}/>}

      {/* Actual content */}
      <Brand />
      <Navigation />
    </header>
  );
}

const Brand = () => {
  const location = useLocation();
  const { isRecording } = useStudioState();

  return (
    <Link to={{ pathname: '/', search: location.search }}
      tabIndex={isRecording ? '-1' : '0'}
      sx={{ ':focus-visible': {
        outline: theme => `5px solid ${theme.colors.focus[2]} !important`,
        outlineOffset: '-5px',
      }
      }}>
      <picture sx={{ display: 'block', height: theme => theme.heights.headerHeight }}>
        <source
          media="(min-width: 920px)"
          srcSet={`${process.env.PUBLIC_URL}/opencast-studio.svg`}
        />
        <img
          src={`${process.env.PUBLIC_URL}/opencast-studio-small.svg`}
          alt="Opencast Studio"
          sx={{ height: theme => theme.heights.headerHeight }}
        />
      </picture>
    </Link>
  );
};

// One element (link) in the navigation.
const NavElement = ({ target, children, icon, ...rest }) => {
  const location = useLocation();
  const { isRecording } = useStudioState();
  const [ colorMode ] = useColorMode();

  return (
    <NavLink
      to={{
        pathname: target,
        search: location.search,
      }}
      tabIndex={isRecording ? '-1' : '0'}
      exact
      activeStyle={{
        backgroundColor: 'black',
      }}
      sx={{
        color: 'white',
        pl: [3, '12px'],
        pr: [3, '12px'],
        textDecoration: 'none',
        fontSize: '18px',
        height: ['auto', '100%'],
        borderLeft: ['none', theme => `1px solid ${theme.colors.gray[colorMode === 'dark' ? 1 : 3]}`],
        display: ['block', 'inline-block'],
        width: ['100%', 'auto'],

        '&:hover': {
          backgroundColor: colorMode === 'dark' ? 'gray.3' : 'gray.1',
        },
        ':focus-visible': {
          outline: theme => `5px solid ${theme.colors.focus[2]} !important`,
          outlineOffset: '-5px',
        },
      }}
      {...rest}
    >
      <div sx={{
        width: '20px',
        display: 'inline-block',
        textAlign: 'right',
        mr: [3, 3, 2],
        '@media screen and (max-width: 742px)': {
          mr: [0, 0, 0],
        },
        '@media screen and (max-width: 575px)': {
          mr: [3, 3, 2],
        }
      }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div sx={{
        display: 'inline-block',
        '@media screen and (max-width: 742px)': {
          display: 'none'
        },
        '@media screen and (max-width: 575px)': {
          display: 'inline-block',
        }
      }}>
        {children}
      </div>
    </NavLink>
  );
};

// The whole responsive navigation element.
const Navigation = props => {
  const [isOpened, updateIsOpened] = useState(false);
  const toggleMenu = () => updateIsOpened(!isOpened);
  const closeMenu = () => updateIsOpened(false);
  const { t } = useTranslation();
  const [colorMode] = useColorMode();

  return (
    <Fragment>
      <button
        onClick={toggleMenu}
        title={t('nav-open-menu-button')}
        sx={{
          display: ['inline-block', 'none'],
          border: theme => `2px solid ${theme.colors.gray[3]}`,
          borderRadius: '10px',
          color: 'white',
          my: 1,
          px: 3,
          mx: 1,
          fontSize: '20px',
          whiteSpace: 'nowrap',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'gray.1',
          },
          '&:active': {},
        }}
      >
        {t('nav-open-menu-button')}
        <span sx={{ width: '23px', display: 'inline-block' }}>
          <FontAwesomeIcon
            icon={isOpened ? faTimes : faCaretDown}
            sx={{ ml: '10px' }}
          />
        </span>
      </button>
      <nav
        ref={n => {
          if (n) {
            n.style.height = isOpened ? n.scrollHeight + 'px' : "";
          }
        }}
        sx={{
          overflow: 'hidden',
          zIndex: 10,
          // This "!important" is necessary unfortunately to override the inline
          // style set in the `ref` attribute above. Otherwise opening the menu
          // in mobile view and switching to desktop view (e.g. by rotating
          // phone) would result in a very strange artifact.
          height: ['0px', '100% !important'],
          top: [theme => theme.heights.headerHeight, theme => theme.heights.headerHeight, 0],
          position: ['absolute', 'static'],
          width: ['100%', 'auto'],
          backgroundColor: [colorMode === 'dark' ? 'gray.4' : 'gray.0', 'none'],
          transition: ['height 0.25s ease-out 0s', 'none'],
          scrollX: ['none', 'auto'],
        }}
      >
        <NavElement
          target="/"
          icon={faVideo}
          onClick={closeMenu}
        >
          {t('nav-recording')}
        </NavElement>
        <NavElement
          target="/settings"
          icon={faWrench}
          onClick={closeMenu}
        >
          {t('nav-settings')}
        </NavElement>
        <NavElement
          target="/shortcuts"
          icon={faKeyboard}
          onClick={closeMenu}
        >
          {t('nav-shortcuts')}
        </NavElement>
        <NavElement
          target="/about"
          icon={faInfoCircle}
          onClick={closeMenu}
        >
          {t('nav-about')}
        </NavElement>
      </nav>

      {/* A black, half-transparent overlay over the body */}
      {isOpened && <div
        onClick={closeMenu}
        ref={n => n && (n.style.opacity = 1)}
        sx={{
          display: [isOpened ? 'block' : 'none', 'none'],
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          position: 'fixed',
          zIndex: -10,
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0,
          transition: 'opacity 0.25s ease-out 0s',
        }}
      ></div>}
    </Fragment>
  );
};
