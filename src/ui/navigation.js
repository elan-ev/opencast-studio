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
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from '@fortawesome/free-brands-svg-icons';


// For browser windows with widths below this value, the menu button and
// and expandable menu is shown. Otherwise, the menu entries are inline in the
// header.
const THRESHOLD = 700;

// One element (link) in the navigation.
const NavElement = ({ target, children, icon, ...rest }) => {
  const attrs = {
    sx: {
      color: 'white',
      display: 'inline-block',
      px: '10px',
      textDecoration: 'none',
      fontSize: '18px',

      '&:hover': {
        backgroundColor: 'gray.1',
      },

      [`@media (min-width: ${THRESHOLD}px)`]: {
        borderLeft: theme => `1px solid ${theme.colors.gray[3]}`,
        height: '100%',
      },
      [`@media (max-width: ${THRESHOLD}px)`]: {
        display: 'block',
        width: '100%',
        px: '20px',
        border: 'none',
      }
    },
    ...rest
  };

  const inner = (
    <Fragment>
      <div sx={{
        width: '20px',
        display: 'inline-block',
        textAlign: 'right',
        [`@media (min-width: ${THRESHOLD}px)`]: {
          mr: '8px',
        },
        [`@media (max-width: ${THRESHOLD}px)`]: {
          mr: '14px',
        }
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
          display: 'none',
          border: theme => `2px solid ${theme.colors.gray[3]}`,
          borderRadius: '10px',
          color: 'white',
          my: '3px',
          px: '8px',
          mx: '5px',
          fontSize: '20px',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'gray.1',
          },
          '&:active': {},
          [`@media (max-width: ${THRESHOLD}px)`]: {
            display: 'inline-block',
          },
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
          [`@media (max-width: ${THRESHOLD}px)`]: {
            top: theme => theme.heights.headerHeight,
            position: 'absolute',
            width: '100%',
            backgroundColor: 'gray.0',
            overflow: 'hidden',
            zIndex: 10,
            transition: 'height 0.25s ease-out 0s',
            height: '0px',
          },
          [`@media (min-width: ${THRESHOLD}px)`]: {
            height: '100% !important',
          }
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
          {' '}
          <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
        </NavElement>
      </nav>

      {/* A black, half-transparent overlay over the body */}
      {isOpened && <div
        onClick={toggleMenu}
        ref={n => n && (n.style.opacity = 1)}
        sx={{
          display: isOpened ? 'block' : 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          position: 'fixed',
          zIndex: -1,
          top: theme => theme.heights.headerHeight,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: 0,
          transition: 'opacity 0.25s ease-out 0s',
          [`@media (min-width: ${THRESHOLD}px)`]: {
            display: 'none',
          }
        }}
      ></div>}
    </Fragment>
  );
};

export default Navigation;
