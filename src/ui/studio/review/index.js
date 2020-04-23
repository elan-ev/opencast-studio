//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import React, { useEffect } from 'react';
import { Flex, Spinner, Text } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';

import { ActionButtons, VideoBox } from '../elements';
import { useStudioState, useDispatch } from '../../../studio-state';
import Notification from '../../notification';


export default function Review(props) {
  const { t } = useTranslation();
  const recordingDispatch = useDispatch();
  const { recordings, prematureRecordingEnd } = useStudioState();
  const emptyRecording = recordings.some(rec => rec.media.size === 0);

  const handleBack = () => {
    const doIt = window.confirm(t('confirm-discard-recordings'));
    if (doIt) {
      recordingDispatch({ type: 'RESET' });
      props.firstStep();
    }
  };

  const handleNext = () => {
    props.nextStep();
  };

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        padding: 3,
      }}
    >
      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        {t('review-heading')}
      </Styled.h1>

      { prematureRecordingEnd && (
        <Notification isDanger>
          <Text>
            {t('error-lost-video-stream')} {t('error-lost-video-stream-end-recording')}
          </Text>
        </Notification>
      )}

      { emptyRecording && (
        <Notification isDanger>{t('review-error-empty-recording')}</Notification>
      )}

      <Preview />

      <div sx={{ mb: 3 }}></div>

      <ActionButtons
        prev={{
          onClick: handleBack,
          danger: true,
          label: 'review-button-discard-and-record',
        }}
        next={{ onClick: handleNext }}
      />
    </Flex>
  );
};

const Preview = () => {
  const { recordings } = useStudioState();
  const { t } = useTranslation();

  const videoRefs = [React.createRef(), React.createRef()];
  const desktopIndex = recordings.length === 2
    ? (recordings[0].deviceType === 'desktop' ? 0 : 1)
    : null;

  // Setup synchronization between both video elements
  useEffect(() => {
    if (recordings.length === 2 && videoRefs[0].current && videoRefs[1].current) {
      // If we have two recordings, both will have audio. But the user doesn't
      // want to hear audio twice, so we mute one video element. Particularly,
      // we mute the desktop video, as there the audio/video synchronization is
      // not as critical.
      videoRefs[desktopIndex].current.volume = 0;

      // The index of the last video ref that received an event (0 or 1).
      let lastOrigin = null;

      const va = videoRefs[0].current;
      const vb = videoRefs[1].current;

      // Helper function to add event listener to both video streams. Assumes that
      // the refs are valid, i.e. `current` is pointing to the video element.
      const installEventHandlers = (eventName, handler) => {
        // Stores if the event was triggered by us (the code) as opposed to "by
        // the user". This always flips as the user triggers the first event and
        // we always react with one action that triggers one event.
        let weTriggered = false;

        // Add event listener for both video elements
        va.addEventListener(eventName, event => {
          if (!weTriggered) {
            lastOrigin = 0;
            handler(event, va, vb);
          }

          weTriggered = !weTriggered;
        });
        vb.addEventListener(eventName, event => {
          if (!weTriggered) {
            lastOrigin = 1;
            handler(event, vb, va);
          }

          weTriggered = !weTriggered;
        });
      };

      // Actuall install the handlers for different events
      installEventHandlers('play', (event, origin, target) => {
        target.currentTime = origin.currentTime;
        target.play();
      });
      installEventHandlers('pause', (event, origin, target) => {
        target.currentTime = origin.currentTime;
        target.pause();
      });
      installEventHandlers('seeking', (event, origin, target) => {
        target.currentTime = origin.currentTime;
      });

      // Install backup synchronization that runs regularly.
      let frameCounter = 0;
      const fixTime = () => {
        // Only run every 60 frames.
        if (frameCounter % 60 === 0) {
          // We want the difference to be below 150ms. Usually, even without
          // this backup solution, it should be below 50ms at all time. That's
          // what testing showed.
          const diff = Math.abs(va.currentTime - vb.currentTime);
          if (diff > 0.15 && lastOrigin) {
            const origin = videoRefs[lastOrigin].current;
            const target = videoRefs[lastOrigin === 0 ? 1 : 0].current;
            target.currentTime = origin.currentTime;
          }
        }

        frameCounter++;
        window.requestAnimationFrame(fixTime);
      };
      window.requestAnimationFrame(fixTime);
    }
  });

  if (recordings.length === 0) {
    return <div sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Spinner title={t('save-creation-waiting-for-recordings')} />
    </div>;
  }

  const children = recordings.map((recording, index) => ({
    body: (
      <video
        ref={videoRefs[index]}
        key={index}
        controls
        src={recording.url}
        // Without this, some browsers show a black video element instead of the first frame.
        onLoadedData={e => e.target.currentTime = 0}
        preload="auto"
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ccc',
          outline: 'none'
        }}
      ></video>
    ),
    dimensions: () => recording.dimensions,
  }));

  return <VideoBox gap={20}>{ children }</VideoBox>;
};
