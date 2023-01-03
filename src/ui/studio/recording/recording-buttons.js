//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faCircleNotch,
  faPauseCircle,
  faPlayCircle,
  faStopCircle
} from '@fortawesome/free-solid-svg-icons';

const Button = ({ large, ...rest }) => (
  <button
    sx={{
      display: 'grid',
      backgroundColor: 'transparent',
      border: 'none',
      position: 'relative',
      overflow: 'hidden',
      my: 0,
      mx: large ? '15px' : 0,
      padding: 0,
      fontSize: large ? '5rem' : '3.5rem',
      lineHeight: large ? '5rem' : '3.5rem',
      svg: {
        margin: 0,
        padding: 0,
        outline: 'none'
      }
    }}
    {...rest}
  />
);

export const PauseButton = props => (
  <Button onClick={props.onClick} title={props.title}
    sx={{
      '&:focus-visible': {
        outline: theme => `7px solid ${theme.colors.focus[3]} !important`,
        outlineOffset: '-1px',
        borderRadius: '50%',
      },
    }}
  >
    <span className='fa-layers'>
      <FontAwesomeIcon icon={faPauseCircle} sx={{ color: 'button_bg' }} />
    </span>
  </Button>
);

export const RecordButton = props => (
  <Button
    onClick={props.onClick}
    title={props.title}
    large={props.large ? 1 : 0}
    disabled={props.disabled || props.countdown}
    sx={{
      color: '#bd181c !important',
      'svg + svg': { color: '#e22319' },
      ':disabled': { color: '#aaa' },
      ':disabled svg + svg': { color: '#bbb' },
      '&:focus-visible': {
        outline: theme => `7px solid ${theme.colors.focus[0]} !important`,
        outlineOffset: '-1px',
        borderRadius: '50%',
      },
    }}
  >
    <span className='fa-layers record-buttons'>
      <FontAwesomeIcon icon={props.countdown ? faCircleNotch : faCircle} spin={props.countdown} />
      <FontAwesomeIcon icon={faCircle} transform='shrink-6' />
    </span>
  </Button>
);

export const ResumeButton = props => (
  <Button onClick={props.onClick} title={props.title}
    sx={{
      '&:focus-visible': {
        outline: theme => `7px solid ${theme.colors.focus[3]} !important`,
        outlineOffset: '-1px',
        borderRadius: '50%',
      },
    }}
  >
    <span className='fa-layers'>
      <FontAwesomeIcon icon={faPlayCircle} sx={{ color: 'button_bg' }} />
    </span>
  </Button>
);

export const StopButton = props => (
  <Button
    onClick={props.onClick}
    title={props.title}
    large={!!props.large}
    sx={{
      color: '#bd181c',
      '&:focus-visible': {
        outline: theme => `7px solid ${theme.colors.focus[0]} !important`,
        outlineOffset: '-1px',
        borderRadius: '50%',
      },
    }}
  >
    <FontAwesomeIcon icon={faStopCircle}
      sx={{ color: '#bd181c !important' }}
    />
  </Button>
);
