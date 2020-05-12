//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { Fragment, forwardRef, useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Link, IconButton, Flex, Spinner, Text } from '@theme-ui/components';
import { Trans, useTranslation } from 'react-i18next';

import { ActionButtons, StepContainer, VideoBox } from '../elements';
import { useStudioState, useDispatch } from '../../../studio-state';
import Notification from '../../notification';
import { ReactComponent as CutOutIcon } from './cut-out-icon.svg';


export default function Review(props) {
  const { t } = useTranslation();
  const recordingDispatch = useDispatch();
  const { recordings, prematureRecordingEnd, start, end } = useStudioState();
  const emptyRecording = recordings.some(rec => rec.media.size === 0);
  const previewController = useRef();
  const [currentTime, setCurrentTime] = useState(0);

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
    <StepContainer>
      <Styled.h1>{ t('review-heading') }</Styled.h1>

      {prematureRecordingEnd && (
        <Notification isDanger>
          <Text>{t('error-lost-stream-end-recording')}</Text>
        </Notification>
      )}

      {emptyRecording && (
        <Notification isDanger>{t('review-error-empty-recording')}</Notification>
      )}

      <Preview ref={previewController} onTimeUpdate={event => {
        setCurrentTime(event.target.currentTime);
      }} />

      <Flex
        sx={{
          justifyContent: 'space-between',
        }}
      >
        <div>
          <CutControls
            marker="start"
            value={start}
            control={end}
            invariant={(start, end) => start < end}
            { ...{ currentTime } }
            { ... { previewController } }
            { ...{ recordingDispatch } }
          />
        </div>

        <div sx={{ textAlign: 'right' }}>
          <CutControls
            marker="end"
            value={end}
            control={start}
            invariant={(end, start) => start < end}
            { ...{ currentTime } }
            { ... { previewController } }
            { ...{ recordingDispatch } }
          />
        </div>
      </Flex>

      <div sx={{ mb: 3 }} />

      <ActionButtons
        prev={{
          onClick: handleBack,
          danger: true,
          label: 'review-button-discard-and-record',
        }}
        next={{ onClick: handleNext }}
      />
    </StepContainer>
  );
};

const CutControls = (
  { marker, value, control, invariant, currentTime, previewController, recordingDispatch }
) => {
  const { t } = useTranslation();
  return <Fragment>
    {value == null
      ? t(`review-no-${marker}`)
      : <Fragment>
        <Trans { ...{ t } } i18nKey={`review-${marker}`}>
          {{ [marker]: value }} <Link href="" onClick={event => {
            event.preventDefault();
            previewController.current.currentTime = value;
          }} />
        </Trans>
        <IconButton title={t(`review-remove-${marker}-end`)} onClick={
          () => recordingDispatch({
            type: `UPDATE_${marker.toUpperCase()}`,
            payload: null,
          })
        }><FontAwesomeIcon icon={faTrash}/></IconButton>
      </Fragment>}<br />

    <button disabled={control != null && !invariant(currentTime, control)} onClick={() => {
      let value = previewController.current.currentTime;
      // We disable the buttons when the generated values would be invalid,
      // but we rely on `timeupdate` events for that, which are not guaranteed
      // to be timely, so we still have to check the invariant when actually
      // updating the state. Here we decided to just clamp the value appropriately.
      if (control != null && !invariant(value, control)) {
          value = control;
      }
      recordingDispatch({
        type: `UPDATE_${marker.toUpperCase()}`,
        payload: value,
      });
    }}>{t(`review-set-${marker}`)}</button>
  </Fragment>;
};

const Preview = forwardRef(function _Preview({ onTimeUpdate }, ref) {
  const { recordings, start, end } = useStudioState();
  const { t } = useTranslation();

  const videoRefs = [useRef(), useRef()];

  const desktopIndex = recordings.length === 2
    ? (recordings[0].deviceType === 'desktop' ? 0 : 1)
    : null;

  // The index of the last video ref that received an event (0 or 1).
  const lastOrigin = useRef();

  useImperativeHandle(ref, () => ({
    get currentTime() {
      return videoRefs[lastOrigin.current || 0].current.currentTime;
    },
    set currentTime(currentTime) {
      videoRefs[lastOrigin.current || 0].current.currentTime = currentTime;
    }
  }));

  // Some browsers don't calculate the duration for the recorded videos
  // preventing us from seeking in the video. We force it below
  // in the event handlers of the video elements, but we want to hold off
  // on some effects until that calculation is done.
  const [durationCalculated, setDurationCalculated] = useState({
    0: false,
    1: false,
  });

  // This will be updated in `onTimeUpdate` below.
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Setup synchronization between both video elements
  useEffect(() => {
    if (!(durationCalculated[0] && durationCalculated[1])) {
      return;
    }

    if (recordings.length === 2 && videoRefs[0].current && videoRefs[1].current) {
      // If we have two recordings, both will have audio. But the user doesn't
      // want to hear audio twice, so we mute one video element. Particularly,
      // we mute the desktop video, as there the audio/video synchronization is
      // not as critical.
      videoRefs[desktopIndex].current.volume = 0;

      const va = videoRefs[0].current;
      const vb = videoRefs[1].current;

      // Collect event listeners in here for later removal
      const eventListeners = [new Map(), new Map()];

      // Helper function to add event listener to both video streams. Assumes that
      // the refs are valid, i.e. `current` is pointing to the video element.
      const installEventHandlers = (eventName, handler) => {
        // Stores if the event was triggered by us (the code) as opposed to "by
        // the user". This always flips as the user triggers the first event and
        // we always react with one action that triggers one event.
        let weTriggered = false;

        const wrapListener = origin => event => {
          if (!weTriggered) {
            lastOrigin.current = origin;
            handler(event, videoRefs[origin].current, videoRefs[1 - origin].current);
          }

          weTriggered = !weTriggered;
        };

        // Add event listener for both video elements
        for (const i of [0, 1]) {
          const listener = wrapListener(i);
          videoRefs[i].current.addEventListener(eventName, listener);

          let listeners = eventListeners[i].get(eventName);
          if (!listeners) {
            listeners = [];
            eventListeners[i].set(eventName, listeners);
          }
          listeners.push(listener);
        }
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
      let fixRequest;
      const fixTime = () => {
        // Only run every 60 frames.
        if (frameCounter % 60 === 0) {
          // We want the difference to be below 150ms. Usually, even without
          // this backup solution, it should be below 50ms at all time. That's
          // what testing showed.
          const diff = Math.abs(va.currentTime - vb.currentTime);
          if (diff > 0.15 && lastOrigin.current != null) {
            const origin = videoRefs[lastOrigin.current].current;
            const target = videoRefs[lastOrigin.current === 0 ? 1 : 0].current;
            target.currentTime = origin.currentTime;
          }
        }

        frameCounter++;
        fixRequest = window.requestAnimationFrame(fixTime);
      };
      fixRequest = window.requestAnimationFrame(fixTime);

      return () => {
        for (const i of [0, 1]) {
          for (const [name, listeners] of eventListeners[i]) {
            for (const listener of listeners) {
              videoRefs[i].current.removeEventListener(name, listener);
            }
          }
        }

        window.cancelAnimationFrame(fixRequest);
      };
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
      <div sx={{ position: 'relative', width: '100%', height: '100%' }}>
        { overlayVisible && <div sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <CutOutIcon sx={{ height: '4em' }}/>
            <p sx={{ my: 3 }}>{ t('review-part-will-be-removed') }</p>
          </div>
        }
        <video
          ref={videoRefs[index]}
          key={index}
          controls
          src={recording.url}
          onLoadedData={event => {
            // Force the browser to calculate the duration of the stream
            // by seeking way past its end. *fingers crossed*
            // We reset this later in an effect. (See above.)
            // Also without setting the current time once initially,
            // some browsers show a black video element instead of the first frame.
            event.target.currentTime = Number.MAX_VALUE;
          }}
          onTimeUpdate={event => {
            if (!durationCalculated[index]) {
              event.target.currentTime = 0;
              setDurationCalculated(durationCalculated => ({
                ...durationCalculated,
                [index]: true,
              }));
            } else {
              const currentTime = event.target.currentTime;
              const visible = (start !== null && currentTime < start) || (end !== null && currentTime > end);
              setOverlayVisible(visible);
              onTimeUpdate(event);
            }
          }}
          preload="auto"
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ccc',
            outline: 'none'
          }}
        />
      </div>
    ),
    dimensions: () => recording.dimensions,
  }));

  return <VideoBox gap={20}>{children}</VideoBox>;
});
