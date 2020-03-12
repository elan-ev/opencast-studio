//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { NavLink } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faTimes,
  faWrench,
  faInfoCircle,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";


// One element (link) in the navigation.
const NavElement = ({ target, children, icon, ...rest }) => (
  <NavLink
    to={target}
    exact
    activeStyle={{
      backgroundColor: 'black',
    }}
    sx={{
      color: 'white',
      pl: [3, 3, '10px'],
      pr: [3, 3, '14px'],
      textDecoration: 'none',
      fontSize: '18px',
      height: ['auto', 'auto', '100%'],
      borderLeft: ['none', 'none', theme => `1px solid ${theme.colors.gray[3]}`],
      display: ['block', 'block', 'inline-block'],
      width: ['100%', '100%', 'auto'],

      '&:hover': {
        backgroundColor: 'gray.1',
      },
    }}
    {...rest}
  >
    <div sx={{
      width: '20px',
      display: 'inline-block',
      textAlign: 'right',
      mr: [3, 3, 2],
    }}>
      <FontAwesomeIcon icon={icon} />
    </div>
    {children}
  </NavLink>
);

// The whole responsive navigation element.
const Navigation = props => {
  const [isOpened, updateIsOpened] = useState(false);
  const toggleMenu = () => updateIsOpened(!isOpened);
  const closeMenu = () => updateIsOpened(false);
  const { t } = useTranslation();

  return (
    <Fragment>
      <button
        onClick={toggleMenu}
        sx={{
          display: ['inline-block', 'inline-block', 'none'],
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
          height: ['0px', '0px', '100% !important'],
          top: [theme => theme.heights.headerHeight, theme => theme.heights.headerHeight, 0],
          position: ['absolute', 'absolute', 'static'],
          width: ['100%', '100%', 'auto'],
          backgroundColor: ['gray.0', 'gray.0', 'none'],
          transition: ['height 0.25s ease-out 0s', 'height 0.25s ease-out 0s', 'none'],
          scrollX: ['none', 'none', 'auto'],
        }}
      >
        <NavElement target="/" icon={faVideo} onClick={closeMenu}>
          {t('nav-recording')}
        </NavElement>
        <NavElement target="/settings" icon={faWrench} onClick={closeMenu}>
          {t('nav-settings')}
        </NavElement>
        <NavElement target="/about" icon={faInfoCircle} onClick={closeMenu}>
          {t('nav-about')}
        </NavElement>
      </nav>

      {/* A black, half-transparent overlay over the body */}
      {isOpened && <div
        onClick={closeMenu}
        ref={n => n && (n.style.opacity = 1)}
        sx={{
          display: [isOpened ? 'block' : 'none', isOpened ? 'block' : 'none', 'none'],
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

export default Navigation;
