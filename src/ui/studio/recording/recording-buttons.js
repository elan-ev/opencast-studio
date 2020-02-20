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
  <Button onClick={props.onClick} title={props.title}>
    <span className="fa-layers">
      <FontAwesomeIcon icon={faPauseCircle} />
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
      color: '#bd181c',
      'svg + svg': { color: '#e22319' },
      ':disabled': { color: '#aaa' },
      ':disabled svg + svg': { color: '#bbb' }
    }}
  >
    <span className="fa-layers">
      <FontAwesomeIcon icon={props.countdown ? faCircleNotch : faCircle} spin={props.countdown} />
      <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
    </span>
  </Button>
);

export const ResumeButton = props => (
  <Button onClick={props.onClick} title={props.title}>
    <span className="fa-layers">
      <FontAwesomeIcon icon={faPlayCircle} />
    </span>
  </Button>
);

export const StopButton = props => (
  <Button
    onClick={props.onClick}
    title={props.title}
    large={!!props.large}
    sx={{ color: '#bd181c' }}
  >
    <FontAwesomeIcon icon={faStopCircle} />
  </Button>
);
