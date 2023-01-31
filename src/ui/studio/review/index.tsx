//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Themed, useColorMode } from 'theme-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import React, {
  Fragment, forwardRef, useState, useRef, useEffect, useImperativeHandle, SyntheticEvent,
} from 'react';
import { GlobalHotKeys } from 'react-hotkeys';
import { Link, IconButton, Flex, Spinner, Text } from '@theme-ui/components';
import { Trans, useTranslation } from 'react-i18next';

import { ActionButtons, StepContainer, VideoBox } from '../elements';
import { useStudioState, useDispatch, Dispatcher } from '../../../studio-state';
import { useSettings } from '../../../settings';
import Notification from '../../notification';
import { ReactComponent as CutOutIcon } from './cut-out-icon.svg';
import { ReactComponent as CutHereIcon } from './cut-here-icon.svg';
import Tooltip from '../../Tooltip';
import { editShortcuts } from '../../../shortcuts';
import { StepProps } from '../steps';


// In some situation we would like to set the current time to 0 or check for it.
// Thanks to a browser bug, setting the current time to 0 fails. Using a number
// slightly higher works thought. So we use this 1ms time for now. Sigh.
const ALMOST_ZERO = 0.001;

export default function Review(props: StepProps) {
  const { t } = useTranslation();
  const recordingDispatch = useDispatch();
  const { recordings, prematureRecordingEnd, videoChoice } = useStudioState();
  const emptyRecording = recordings.some(rec => rec.media.size === 0);
  const previewController = useRef<PreviewHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);

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

  const expectedRecordings = (() => {
    switch (videoChoice) {
      case 'none':
        return 0;
      case 'both':
        return 2;
      default:
        return 1;
    }
  })();

  return (
    <StepContainer>
      <Themed.h1>{ t('review-heading') }</Themed.h1>

      {prematureRecordingEnd && (
        <Notification isDanger>
          <Text>{t('error-lost-stream-end-recording')}</Text>
        </Notification>
      )}

      {emptyRecording && (
        <Notification isDanger>{t('review-error-empty-recording')}</Notification>
      )}

      {(
        !previewReady || recordings.length !== expectedRecordings
      ) && <div sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spinner title={t('save-creation-waiting-for-recordings')} />
      </div>
      }
      {recordings.length === expectedRecordings && <div sx={previewReady ? {
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column'
      } : {
        display: 'none'
      }}>
        <Preview
          ref={previewController}
          onTimeUpdate={event => {
            setCurrentTime(event.currentTarget.currentTime);
          }}
          onReady={() => setPreviewReady(true)}
        />

        <div sx={{ mb: 3 }} />

        <ControlBox {...{ previewController, currentTime }} />
      </div>}

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

type SharedProps = {
  previewController: React.RefObject<PreviewHandle>;
  currentTime: number;
};

const ControlBox: React.FC<SharedProps> = ({ previewController, currentTime }) => (
  <div sx={{
    backgroundColor: 'gray.4',
    color: 'text',
    borderRadius: '8px',
  }}>
    <VideoControls {...{ previewController, currentTime }} />
    <Scrubber {...{ previewController, currentTime }} />
  </div>
);

const Scrubber: React.FC<SharedProps> = ({ previewController, currentTime }) => {
  const duration = previewController.current?.duration || Infinity;
  const { start, end } = useStudioState();

  const [colorMode] = useColorMode();

  const setTime = mouseEvent => {
    const rect = mouseEvent.target.getBoundingClientRect();
    const x = mouseEvent.clientX - rect.x;
    let progress = x / rect.width;
    if (progress < 0) {
      progress = 0;
    } else if (progress > 1) {
      progress = 1;
    }

    if (previewController.current) {
      previewController.current.currentTime = progress * duration;
    }
  };

  const cutStyle = {
    position: 'absolute',
    backgroundColor: colorMode === 'dark' ? 'gray.2' : 'gray.3',
    height: '100%',
    boxSizing: 'content-box',
  } as const;

  return (
    <div sx={{ p: 2 }}>
      <div sx={{ py: 1, position: 'relative' }}>
        <div
          onClick={e => setTime(e)}
          onMouseMove={e => {
            // Ignore unless only the primary button is pressed (`buttons` is a
            // bitset).
            if (e.buttons === 1) {
              // TODO: maybe debounce this? Browsers seem to somewhat debounce
              // that already.
              setTime(e);
            }
          }}
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            top: 0,
            zIndex: 10,
          }}
        />
        <div sx={{
          position: 'relative',
          backgroundColor: '#6bc295',
          height: '12px',
          width: '100%',
          borderRadius: '6px',
          overflow: 'hidden',
          '@media not (any-pointer: fine)': {
            height: '20px',
            borderRadius: '10px',
          }
        }}>
          { (start != null && start > 0) && <div sx={{
            left: 0,
            borderRight: '2px solid black',
            width: `${(start / duration) * 100}%`,
            ...cutStyle,
          }} /> }
          { (end != null && end < duration) && <div sx={{
            right: 0,
            borderLeft: '2px solid black',
            width: `${((duration - end) / duration) * 100}%`,
            ...cutStyle,
          }} /> }
          <div sx={{
            position: 'absolute',
            left: 0,
            width: `${(currentTime / duration) * 100}%`,
            backgroundColor: 'black',
            height: '100%',
            opacity: 0.3,
          }} />
        </div>
      </div>
    </div>
  );
};

const VideoControls: React.FC<SharedProps> = ({ currentTime, previewController }) => {
  const { start, end } = useStudioState();
  const recordingDispatch = useDispatch();
  const settings = useSettings();
  const { t } = useTranslation();

  const duration = previewController.current?.duration;

  const switchPlayPause = () => {
    const controller = previewController.current;
    if (controller == null) {
      return;
    }
    if (controller.isPlaying) {
      controller.pause();
    } else if (controller.isReadyToPlay) {
      controller.play();
    }
  };

  const leftMarker = useRef<HTMLButtonElement>(null);
  const rightMarker = useRef<HTMLButtonElement>(null);

  const handlers = {
    PLAY_PAUSE: switchPlayPause,
    DELETE_CROP_MARK_LEFT: () => leftMarker.current?.click(),
    DELETE_CROP_MARK_RIGHT: () => rightMarker.current?.click(),
  };

  return <div sx={{ textAlign: 'center' }}>
    <GlobalHotKeys keyMap={editShortcuts} handlers={handlers}>
      <Flex
        sx={{
          backgroundColor: 'gray.4',
          p: 2,
          justifyContent: 'center',
          alignItems: 'flex-end',
          '& > *': {
            mx: 2,
          }
        }}
      >
        { settings.review?.disableCutting || <CutControls
          marker="start"
          ref={leftMarker}
          value={start}
          control={end}
          invariant={(start, end) => start < end}
          { ...{ recordingDispatch, previewController, currentTime } }
        /> }
        <Tooltip content={previewController.current?.isPlaying ? t('review-pause') : t('review-play')}>
          <button
            sx={{ backgroundColor: 'transparent', border: 'none', mx: 3, color: 'gray.0' }}
            onClick={() => {
              const controller = previewController.current;
              if (controller) {
                if (controller.isPlaying) {
                  controller.pause();
                } else if (controller.isReadyToPlay) {
                  controller.play();
                }
              }
            }}
          >
            <FontAwesomeIcon
              icon={previewController.current?.isPlaying ? faPause : faPlay}
              sx={{ fontSize: '50px', opacity: 0.8, '&:hover': { opacity: 1 }}}
            />
          </button>
        </Tooltip>
        { settings.review?.disableCutting || <CutControls
          marker="end"
          ref={rightMarker}
          value={end}
          control={start}
          invariant={(end, start) => start < end}
          { ...{ recordingDispatch, previewController, currentTime } }
        /> }
      </Flex>
      {t('review-player-progress', { currentTime, duration })}
    </GlobalHotKeys>
  </div>;
};

type CutControlsProps = SharedProps & {
  marker: "start" | "end",
  value: number | null,
  control: number | null,
  invariant: (self: number, control: number) => boolean;
  recordingDispatch: Dispatcher,
};

const CutControls = React.forwardRef<HTMLButtonElement, CutControlsProps>((
  { marker, value, control, invariant, currentTime, previewController, recordingDispatch },
  ref,
) => {
  const { t } = useTranslation();

  const handlers = {
    CUT_LEFT: () => document.getElementById("leftmarker")?.click(),
    CUT_RIGHT: () => document.getElementById("rightmarker")?.click(),
  };

  const state = (
    <GlobalHotKeys keyMap={editShortcuts} handlers={handlers}>
      <div sx={{ flex: 1, textAlign: marker === 'start' ? 'right' : 'left', color: 'gray.0' }}>
        { value !== null && <Fragment>
          <Trans { ...{ t } } i18nKey={`review-${marker}`}>
            {{ [marker]: value }} <Link href="" onClick={event => {
              event.preventDefault();
              if (previewController.current) {
                previewController.current.currentTime = value;
              }
            }} />
          </Trans>
          <Tooltip content={t(`review-remove-cut-point`)}>
            <IconButton
              ref={ref} // for DELETE_CROP_MARK
              onClick={
                () => recordingDispatch({
                  type: marker === "start" ? "UPDATE_START" : "UPDATE_END",
                  time: null,
                })}
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </Tooltip>
        </Fragment> }
      </div>
    </GlobalHotKeys>
  );

  const disabled = currentTime <= ALMOST_ZERO
    || (previewController.current && currentTime >= previewController.current.duration)
    || (control != null && !invariant(currentTime, control));

  const button = (
    <GlobalHotKeys keyMap={editShortcuts} handlers={handlers}>
      <Tooltip content={t(`review-set-${marker}`)}>
        <button
          id={marker === 'start' ? 'leftmarker' : 'rightmarker'}
          {...{ disabled }}
          onClick={() => {
            let value = previewController.current.currentTime;
            // We disable the buttons when the generated values would be invalid,
            // but we rely on `timeupdate` events for that, which are not guaranteed
            // to be timely, so we still have to check the invariant when actually
            // updating the state. Here we decided to just clamp the value appropriately.
            if (control != null && !invariant(value, control)) {
              value = control;
            }
            recordingDispatch({
              type: marker === 'start' ? 'UPDATE_START' : 'UPDATE_END',
              time: value,
            });
          }}
          sx={{
            backgroundColor: 'transparent',
            color: 'text',
            border: 'none',
            pt: '4px',
            px: '8px',
            borderRadius: '4px',
            '&:disabled': {
              opacity: 0.3,
            },
            '&:not(:disabled):hover': {
              backgroundColor: 'gray.3'
            },
          }}
        >
          <CutHereIcon sx={{ height: '32px', transform: marker === 'end' ? 'scaleX(-1)' : '' }} />
        </button>
      </Tooltip>
    </GlobalHotKeys>
  );

  return marker === 'start'
    ? <Fragment>{ state }{ button }</Fragment>
    : <Fragment>{ button }{ state }</Fragment>;
});

type PreviewProps = {
  onTimeUpdate: (event: SyntheticEvent<HTMLVideoElement, Event>) => void,
  onReady: () => void,
};

type PreviewHandle = {
  currentTime: number,
  readonly duration: number,
  readonly isPlaying: boolean,
  readonly isReadyToPlay: boolean,
  play(): void;
  pause(): void;
};

const Preview = forwardRef<PreviewHandle, PreviewProps>(({ onTimeUpdate, onReady }, ref) => {
  const { recordings, start, end } = useStudioState();
  const { t } = useTranslation();

  const videoRefs = [useRef<HTMLVideoElement>(), useRef<HTMLVideoElement>()];
  const allVideos = videoRefs.slice(0, recordings.length);

  const desktopIndex = recordings.length === 2
    ? (recordings[0].deviceType === 'desktop' ? 0 : 1)
    : null;

  // The index of the last video ref that received an event (0 or 1).
  const lastOrigin = useRef<0 | 1>();

  const unwrap = <T, >(v: T | undefined): T => {
    if (v == null) {
      throw new Error('bug in Preview controller');
    }
    return v;
  };

  useImperativeHandle(ref, () => ({
    get currentTime() {
      return unwrap(videoRefs[lastOrigin.current ?? 0].current?.currentTime);
    },
    set currentTime(currentTime) {
      allVideos.forEach(r => {
        if (r.current && currentTime) {
          r.current.currentTime = currentTime;
        }
      });
    },
    get duration() {
      return unwrap(videoRefs[lastOrigin.current ?? 0].current?.duration);
    },
    get isPlaying() {
      const v = videoRefs[lastOrigin.current ?? 0].current;
      return v != null && v.currentTime > 0 && !v.paused && !v.ended;
    },
    get isReadyToPlay() {
      // State 2 means "at least enough data to play one frame"
      return allVideos.every(r => (r.current?.readyState ?? 0) >= 2);
    },
    play() {
      allVideos.forEach(r => r.current?.play());
    },
    pause() {
      allVideos.forEach(r => r.current?.pause());
    },
  }));

  // Some browsers don't calculate the duration for the recorded videos
  // preventing us from seeking in the video. We force it below
  // in the event handlers of the video elements, but we want to hold off
  // on some effects until that calculation is done.
  type DurationCalcState = 'done' | 'started';
  const durationCalculationProgress = [
    useRef<DurationCalcState>(null),
    useRef<DurationCalcState>(null),
  ];
  const [durationsCalculated, setDurationsCalculated] = useState<boolean>();

  // Some logic to decide whether we currently are in a part of the video that
  // will be removed. The state will be updated in `onTimeUpdate` below and is
  // only here to trigger a rerender: the condition for rendering the overlay is
  // below.
  const isInCutRegion = (time: number) =>
    (start !== null && time < start) || (end !== null && time > end);
  const currentTime = videoRefs[lastOrigin.current ?? 0].current?.currentTime || 0;
  const overlayVisible = isInCutRegion(currentTime);
  const [, setOverlayVisible] = useState(overlayVisible);

  useEffect(() => {
    if (durationsCalculated) {
      onReady();
    }
  }, [onReady, durationsCalculated]);

  // Setup backup synchronization between both video elements
  useEffect(() => {
    if (!durationsCalculated) {
      return;
    }

    if (desktopIndex != null) {
      // If we have two recordings, both will have audio. But the user doesn't
      // want to hear audio twice, so we mute one video element. Particularly,
      // we mute the desktop video, as there the audio/video synchronization is
      // not as critical.
      unwrap(videoRefs[desktopIndex].current).volume = 0;

      const va = unwrap(videoRefs[0].current);
      const vb = unwrap(videoRefs[1].current);

      // We regularly check if both video elements diverge too much from one
      // another.
      let frameCounter = 0;
      let fixRequest: number;
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
            unwrap(target).currentTime = unwrap(origin).currentTime;
          }
        }

        frameCounter++;
        fixRequest = window.requestAnimationFrame(fixTime);
      };
      fixRequest = window.requestAnimationFrame(fixTime);

      return () => window.cancelAnimationFrame(fixRequest);
    }
  });

  const skipFiveSeconds = (keyEvent?: KeyboardEvent) => {
    videoRefs.forEach( video => {
      if (video.current !== undefined) {
        if (keyEvent?.key === 'l' || keyEvent?.key === 'ArrowRight') {
          video.current.currentTime = Math.min(video.current.duration, video.current.currentTime + 5);
        } else if (keyEvent?.key === 'j' || keyEvent?.key === 'ArrowLeft') {
          video.current.currentTime = Math.max(0, video.current.currentTime - 5);
        }
      }
    });
  };

  const skipFrame = (keyEvent?: KeyboardEvent) => {
    const fps = 30;

    videoRefs.forEach( video => {
      if (video.current !== undefined) {
        if (keyEvent?.key === '.') {
          video.current.currentTime = Math.min(video.current.duration, video.current.currentTime + (1 / fps));
        } else if (keyEvent?.key === ',') {
          video.current.currentTime = Math.max(0, video.current.currentTime - (1 / fps));
        }
      }
    });
  };

  const handlers = {
    FORWARD_5_SEC: skipFiveSeconds,
    BACKWARDS_5_SEC: skipFiveSeconds,
    FORWARD_1_FRAME: skipFrame,
    BACKWARDS_1_FRAME: skipFrame,
  };


  const children = recordings.map((recording, index) => ({
    body: (
      <GlobalHotKeys keyMap={editShortcuts} handlers={handlers}>
        <div sx={{ position: 'relative', width: '100%', height: '100%' }}>
          { overlayVisible && <div
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
            src={recording.url}
            onLoadedData={event => {
              // Force the browser to calculate the duration of the stream
              // by seeking way past its end. *fingers crossed*
              // We reset this later in an effect. (See above.)
              // Also without setting the current time once initially,
              // some browsers show a black video element instead of the first frame.
              event.currentTarget.currentTime = Number.MAX_VALUE;
              durationCalculationProgress[index].current = 'started';
            }}
            onTimeUpdate={durationsCalculated ? event => {
              const currentTime = event.currentTarget.currentTime;
              setOverlayVisible(isInCutRegion(currentTime));

              onTimeUpdate(event);
            } : event => {
              if (!durationsCalculated) {
                switch (durationCalculationProgress[index].current) {
                  case 'started':
                    event.currentTarget.currentTime = ALMOST_ZERO;
                    durationCalculationProgress[index].current = 'done';
                    break;
                  case 'done':
                    if (durationCalculationProgress.filter(
                      p => p.current === 'done'
                    ).length === recordings.length) {
                      setDurationsCalculated(true);
                    }
                    break;
                  default:
                    // Appease the linter
                    break;
                }
              }} // eslint-disable-line
            }
            preload="auto"
            tabIndex={-1}
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ccc',
              outline: 'none'
            }}
          />
        </div>
      </GlobalHotKeys>
    ),
    dimensions: () => recording.dimensions,
  }));

  return <VideoBox gap={20}>{children}</VideoBox>;
});
