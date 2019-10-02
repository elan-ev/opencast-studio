//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import Button from './button';

const RecordButton = styled(function(props) {
  return (
    <Button
      className={props.className}
      onClick={props.onClick}
      title={props.title}
      large={!!props.large}
      disabled={props.disabled || props.countdown}
    >
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={props.countdown ? faCircleNotch : faCircle} spin />
        <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
      </span>
    </Button>
  );
})`
  color: #bd181c;

  svg + svg {
    color: #e22319;
  }

  :disabled {
    color: #aaa;
  }

  :disabled svg + svg {
    color: #bbb;
  }
`;

export default RecordButton;
