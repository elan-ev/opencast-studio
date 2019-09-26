//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPauseCircle } from '@fortawesome/free-solid-svg-icons';
import Button from './button'

const PauseButton = styled(function(props) {
  return (
      <Button className={props.className} onClick={props.onClick} title={props.title}>
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faPauseCircle} />
      </span>
    </Button>
  );
})`
  border-color: ${props => (props.recording ? 'black' : '#888')};
  box-shadow: ${props => (props.paused ? 'inset 0 2px 3px rgba(0, 0, 0, 0.2)' : 'none')};
`;

export default PauseButton;
