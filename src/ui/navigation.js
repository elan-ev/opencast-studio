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
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from '@fortawesome/free-brands-svg-icons';


// One element (link) in the navigation.
const NavElement = ({ target, children, icon, ...rest }) => {
  const attrs = {
    sx: {
      color: 'white',
      pl: [3, '10px'],
      pr: [3, '14px'],
      textDecoration: 'none',
      fontSize: '18px',
      height: ['auto', '100%'],
      borderLeft: ['none', theme => `1px solid ${theme.colors.gray[3]}`],
      display: ['block', 'inline-block'],
      width: ['100%', 'auto'],

      '&:hover': {
        backgroundColor: 'gray.1',
      },
    },
    ...rest
  };

  const inner = (
    <Fragment>
      <div sx={{
        width: '20px',
        display: 'inline-block',
        textAlign: 'right',
        mr: [3, 2],
      }}>
        <FontAwesomeIcon icon={icon} />
      </div>
      {children}
    </Fragment>
  );

  if (target.startsWith('/')) {
    return (
      <NavLink
        to={target}
        activeStyle={{
          backgroundColor: 'black',
        }}
        {...attrs}
      >{inner}</NavLink>
    );
  } else {
    return <a href={target} {...attrs}>{inner}</a>
  }
};

// The whole responsive navigation element.
const Navigation = props => {
  const [isOpened, updateIsOpened] = useState(false);
  const toggleMenu = () => updateIsOpened(!isOpened);
  const { t } = useTranslation();

  return (
    <Fragment>
      <button
        onClick={toggleMenu}
        sx={{
          display: ['inline-block', 'none'],
          border: theme => `2px solid ${theme.colors.gray[3]}`,
          borderRadius: '10px',
          color: 'white',
          my: 1,
          px: 3,
          mx: 1,
          fontSize: '20px',
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
          top: [theme => theme.heights.headerHeight, 0],
          position: ['absolute', 'static'],
          width: ['100%', 'auto'],
          backgroundColor: ['gray.0', 'none'],
          transition: ['height 0.25s ease-out 0s', 'none'],
        }}
      >
        <NavElement target="/settings" icon={faWrench} onClick={toggleMenu}>
          {t('nav-settings')}
        </NavElement>
        <NavElement target="/about" icon={faInfoCircle} onClick={toggleMenu}>
          {t('nav-about')}
        </NavElement>
        <NavElement
          target="https://github.com/elan-ev/opencast-studio/issues"
          icon={faGithub}
          onClick={toggleMenu}
        >
          {t('nav-report-issue')}
        </NavElement>
      </nav>

      {/* A black, half-transparent overlay over the body */}
      {isOpened && <div
        onClick={toggleMenu}
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

export default Navigation;
