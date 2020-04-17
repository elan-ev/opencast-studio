//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Text, Spinner } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

import { VideoBox, useVideoBoxResize } from '../elements.js';
import { dimensionsOf } from '../../../util.js';
import { useDispatch, useStudioState } from '../../../studio-state';
import { useSettings } from '../../../settings';
import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';


export function SourcePreview({ warnings, inputs }) {
  let children;
  switch (inputs.length) {
    case 1:
      children = [{
        body: <StreamPreview input={inputs[0]} />,
        dimensions: () => dimensionsOf(inputs[0].stream),
      }];
      break;
    case 2:
      children = [
        {
          body: <StreamPreview input={inputs[0]} />,
          dimensions: () => dimensionsOf(inputs[0].stream),
        },
        {
          body: <StreamPreview input={inputs[1]} />,
          dimensions: () => dimensionsOf(inputs[1].stream),
        },
      ];
      break;
    default:
      return <p>Something went very wrong</p>;
  }

  return (
    <Fragment>
      { warnings }
      <VideoBox gap={20}>{ children }</VideoBox>
    </Fragment>
  );
}

function StreamPreview({ input, text }) {
  const stream = input.stream;
  const track = stream?.getVideoTracks()?.[0];
  const { width, height } = track?.getSettings() ?? {};

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <PreviewVideo allowed={input.allowed} unexpectedEnd={input.unexpectedEnd} stream={stream} />
      <StreamSettings isDesktop={input.isDesktop} />
    </Card>
  );
}

const PreviewVideo = ({ allowed, stream, unexpectedEnd, ...props }) => {
  const resizeVideoBox = useVideoBoxResize();

  const videoRef = useRef();
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      if (!v.srcObject) {
        v.srcObject = stream;
      }
      v.addEventListener('resize', resizeVideoBox);
    }

    return () => {
      if (v) {
        v.removeEventListener('resize', resizeVideoBox);
      }
    };
  }, [stream, resizeVideoBox]);

  if (!stream) {
    let inner;
    if (allowed === false || unexpectedEnd) {
      inner = <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />;
    } else {
      inner = <Spinner size="75"/>;
    }

    return (
      <div sx={{
        width: '100%',
        height: '100%',
        minHeight: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        { inner }
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      sx={{
        minHeight: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        // TODO: (mel) research this setting
        // transform: 'rotateY(180deg)'
      }}
    />
  );
};

const StreamSettings = ({ isDesktop }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      <div sx={{ textAlign: 'right' }}>
        <div
          onClick={() => setIsExpanded(old => !old)}
          sx={{
            display: 'inline-block',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            p: '6px',
            m: 2,
            fontSize: '30px',
            lineHeight: '1em',
            borderRadius: '10px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            '&:hover > svg': {
              transform: isExpanded ? 'none' : 'rotate(45deg)',
            },
          }}
        >
          <FontAwesomeIcon
            icon={isExpanded ? faTimes : faCog}
            fixedWidth
            sx={{
              transition: isExpanded ? 'none' : 'transform 0.2s',
              width: '1em !important',
            }}
          />
        </div>
      </div>
      <div sx={{
        height: isExpanded ? '100px' : 0,
        transition: 'height 0.2s',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        fontSize: '18px',
      }}>
        <div sx={{ p: 1 }}>
          <table sx={{ width: '100%', whiteSpace: 'nowrap' }} >
            <tbody>
              { !isDesktop && <UserSettings /> }
            </tbody>
          </table>
          blabla
        </div>
      </div>
    </div>
  );
};

const UserSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSettings();
  const state = useStudioState();

  const currentDeviceId = state.userStream?.getVideoTracks()?.[0]?.getSettings()?.deviceId;
  let devices = [];
  for (const d of state.mediaDevices) {
    // Only intersted in video inputs
    if (d.kind !== 'videoinput') {
      continue;
    }

    // If we already have a device with that device ID, we ignore it.
    if (devices.some(od => od.deviceId === d.deviceId)) {
      continue;
    }

    devices.push(d);
  }

  const changeDevice = id => {
    stopUserCapture(state.userStream, dispatch);
    startUserCapture(dispatch, settings, { deviceId: { exact: id }});
  };

  return <Fragment>
    <tr>
      <td>{t('sources-video-device')}:</td>
      <td>
        <select
          sx={{ fontSize: 'inherit', width: '100%' }}
          value={currentDeviceId}
          onChange={e => changeDevice(e.target.value)}
        >
          {
            devices.map((d, i) => (
              <option key={i} value={d.deviceId}>{ d.label }</option>
            ))
          }
        </select>
      </td>
    </tr>
    <tr>
      <td>Aspect ratio:</td>
      <td>TODO</td>
    </tr>
  </Fragment>;
};
