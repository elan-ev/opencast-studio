//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Fragment, useState } from 'react';

import Steps from './steps';

import AudioSetup, { NONE } from './audio-setup';
import SaveCreation from './save-creation';
import VideoSetup from './video-setup';
import Recording from './recording';
import Review from './review';

import {isRecordingSupported} from '../../util';

export default function Wizard({ settings, activeStep, updateActiveStep }) {
  const [audioChoice, updateAudioChoice] = useState(NONE);

  // If recording is not supported we don't even let the user start the wizard.
  // A warning is shown already (in `warnings.js`).
  if (!isRecordingSupported()) {
    return null;
  }

  return (
    <Fragment>
      <Steps activeStep={activeStep} updateActiveStep={updateActiveStep}>
        <VideoSetup />
        <AudioSetup choice={audioChoice} updateChoice={updateAudioChoice} />
        <Recording settings={settings} />
        <Review />
        <SaveCreation settings={settings} />
      </Steps>
    </Fragment>
  );
}
