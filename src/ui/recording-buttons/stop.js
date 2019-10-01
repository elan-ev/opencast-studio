//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import Button from './button';

const StopButton = styled(function(props) {
  return (
    <Button
      className={props.className}
      onClick={props.onClick}
      title={props.title}
      large={!!props.large}
    >
      <FontAwesomeIcon icon={faStopCircle} />
    </Button>
  );
})`
  color: #bd181c;
`;

export default StopButton;
