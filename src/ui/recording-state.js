//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

import Clock from './clock';

const RecordingState = styled(props => {
  return (
    <div className={props.className}>
      <span>{props.recording ? (props.paused ? 'Paused' : 'Recording') : ' Waiting '}</span>
      <Clock paused={props.paused} recording={props.recording} />
    </div>
  );
})`
  visibility: ${props => (props.paused || props.recording ? 'visible' : 'hidden')};

  font-style: ${props => (props.recording && !props.paused ? 'italic' : 'normal')};
  color: ${props => (props.recording ? (props.paused ? 'teal' : '#fe0001') : 'grey')};

  ${Clock} {
    margin-left: 0.5em;
  }
`;

export default RecordingState;
