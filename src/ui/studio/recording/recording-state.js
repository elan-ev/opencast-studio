//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Clock from './clock';

const RecordingState = props => {
  return (
      <div sx={{ display: "flex", alignItems: 'center', visibility: props.recordingState === 'inactive' ? 'hidden' : 'visible' }}>
      <Clock recordingState={props.recordingState} />
    </div>
  );
};

export default RecordingState;
