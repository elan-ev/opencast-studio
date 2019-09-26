//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Button from './button'

const RecordButton = styled(function(props) {
  return (
    <Button className={props.className} onClick={props.onClick} title={props.title}>
      <span className="fa-layers fa-fw">
        <FontAwesomeIcon icon={faCircle} />
        <FontAwesomeIcon icon={faCircle} transform="shrink-6" />
      </span>
    </Button>
  );
})`
  color: #bd181c;
  svg + svg {
    color: #e22319;
  }

  box-shadow: ${props => (props.recording ? 'inset 0 2px 3px rgba(0, 0, 0, 0.2)' : 'none')};
`;

export default RecordButton;
