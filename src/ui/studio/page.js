//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Fragment } from 'react';

import Steps from './steps';

import AudioSetup from './audio-setup';
import SaveCreation from './save-creation';
import VideoSetup from './video-setup';
import Recording from './recording';

export default function SourcesPage({ settings }) {
  return (
    <Fragment>
      <Steps>
        <VideoSetup />
        <AudioSetup />
        <Recording settings={settings} />
        <SaveCreation settings={settings} />
      </Steps>
    </Fragment>
  );
}
