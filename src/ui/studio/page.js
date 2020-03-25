//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Steps from './steps';

import AudioSetup from './audio-setup';
import SaveCreation from './save-creation';
import VideoSetup from './video-setup';
import Recording from './recording';
import Review from './review';

import {isRecordingSupported} from '../../util';


export default function Wizard({ activeStep, updateActiveStep, userHasWebcam }) {
  // If recording is not supported we don't even let the user start the wizard.
  // A warning is shown already (in `warnings.js`).
  if (!isRecordingSupported()) {
    return null;
  }

  return (
    <Steps activeStep={activeStep} updateActiveStep={updateActiveStep}>
      <VideoSetup userHasWebcam={userHasWebcam} />
      <AudioSetup />
      <Recording />
      <Review />
      <SaveCreation />
    </Steps>
  );
}
