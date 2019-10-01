//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import Button from './button'

const RecordButton = styled(function(props) {
  return (
      <Button className={props.className} onClick={props.onClick} title={props.title} large={!!props.large}>
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
`;

export default RecordButton;
