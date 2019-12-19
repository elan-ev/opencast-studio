//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Box } from '@theme-ui/components';
import { action } from '@storybook/addon-actions';
import * as Buttons from './recording-buttons';

export default { title: 'Recording Controls' };

export const withPauseButtons = () => (
  <Box>
    <Buttons.PauseButton title="small button" onClick={action('pause-button-click')} />
  </Box>
);

export const withRecordButtons = () => (
  <Box>
    <Buttons.RecordButton title="small button" onClick={action('record-button-click')} />
    <Buttons.RecordButton title="large button" large onClick={action('record-button-click')} />
    <Buttons.RecordButton title="disabled button" disabled onClick={action('wont-work')} />
    <Buttons.RecordButton title="countdown button" countdown onClick={action('wont-work')} />
  </Box>
);

export const withResumeButtons = () => (
  <Box>
    <Buttons.ResumeButton title="small button" onClick={action('resume-button-click')} />
  </Box>
);

export const withStopButtons = () => (
  <Box>
    <Buttons.StopButton title="small button" onClick={action('stop-button-click')} />
    <Buttons.StopButton title="large button" large onClick={action('stop-button-click')} />
  </Box>
);
