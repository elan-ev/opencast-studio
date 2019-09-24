//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

const RecordingState = styled(props => {
  return (
    <div className={props.className}>
      {props.recording ? (props.paused ? 'Paused' : 'Recording') : ' Waiting '}
    </div>
  );
})`
  font-style: ${props => (props.recording && !props.paused ? 'italic' : 'normal')};
  color: ${props => (props.recording ? (props.paused ? 'teal' : '#fe0001') : 'grey')};
`;


export default RecordingState;
