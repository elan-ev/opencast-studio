//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Fragment, useState } from 'react';

import Steps from './steps';

import AudioSetup, { NONE } from './audio-setup';
import SaveCreation from './save-creation';
import VideoSetup from './video-setup';
import Recording from './recording';

export default function Wizard({ settings, activeStep, updateActiveStep }) {
  const [audioChoice, updateAudioChoice] = useState(NONE);

  return (
    <Fragment>
      <Steps activeStep={activeStep} updateActiveStep={updateActiveStep}>
        <VideoSetup />
        <AudioSetup choice={audioChoice} updateChoice={updateAudioChoice} />
        <Recording settings={settings} />
        <SaveCreation settings={settings} />
      </Steps>
    </Fragment>
  );
}
