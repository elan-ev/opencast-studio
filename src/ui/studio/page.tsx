//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import Steps from './steps';

import AudioSetup from './audio-setup';
import SaveCreation from './save-creation';
import VideoSetup from './video-setup';
import Recording from './recording';
import Review from './review';

import { isRecordingSupported } from '../../util';

type Props = {
  activeStep: number;
  updateActiveStep: (v: number) => void;
  userHasWebcam: boolean;
};

export default function Wizard({ activeStep, updateActiveStep, userHasWebcam }: Props) {
  // If recording is not supported we don't even let the user start the wizard.
  // A warning is shown already (in `warnings.js`).
  if (!isRecordingSupported()) {
    return null;
  }

  return (
    <Steps activeStep={activeStep} setActiveStep={updateActiveStep} steps={[
      props => <VideoSetup {...props} userHasWebcam={userHasWebcam} />,
      props => <AudioSetup {...props} />,
      props => <Recording {...props} />,
      props => <Review {...props} />,
      props => <SaveCreation {...props} />,
    ]} />
  );
}
