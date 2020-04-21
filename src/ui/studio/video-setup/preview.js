//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Spinner } from '@theme-ui/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

import { VideoBox, useVideoBoxResize } from '../elements.js';
import { deviceIdOf, dimensionsOf } from '../../../util.js';
import { useStudioState } from '../../../studio-state';


// Shows the preview for one or two input streams. The previews also show
// preferences allowing the user to change the webcam and the like.
export const SourcePreview = ({ warnings, inputs }) => {
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

const StreamPreview = ({ input, text }) => (
  <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    <PreviewVideo input={input} />
    <StreamSettings input={input} />
  </Card>
);

const PreviewVideo = ({ input }) => {
  const { allowed, stream, unexpectedEnd } = input;
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

const StreamSettings = ({ input }) => {
  const { isDesktop, updatePrefs, prefs } = input;
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedHeight = useRef(null);

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
        height: isExpanded ? (expandedHeight.current || 'auto') : 0,
        transition: 'height 0.2s',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        fontSize: '18px',

      }}>
        <div
          // Obtain the actual content height as soon as the element is mounted.
          ref={r => { if (r) { expandedHeight.current = `${r.offsetHeight}px`; } }}
          sx={{ p: 1, border: theme => `1px solid ${theme.colors.gray[0]}` }}
        >
          <table sx={{ width: '100%', whiteSpace: 'nowrap' }} >
            <tbody>
              { !isDesktop && <UserSettings {...{ updatePrefs, prefs }} /> }
            </tbody>
          </table>
          blabla
        </div>
      </div>
    </div>
  );
};

const UserSettings = ({ updatePrefs, prefs }) => {
  const { t } = useTranslation();
  const state = useStudioState();

  const currentDeviceId = deviceIdOf(state.userStream);
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

  const changeDevice = id => updatePrefs({ deviceId: id });
  const changeAspectRatio = ratio => updatePrefs({ aspectRatio: ratio });

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
      <td>{t('sources-video-aspect-ratio')}:</td>
      <td>
        <RadioButton
          id="ar-auto"
          value="auto"
          name="aspectRatio"
          label={t('sources-video-aspect-ratio-auto')}
          onChange={changeAspectRatio}
          checked={['4:3', '16:9'].every(x => prefs.aspectRatio !== x)}
        />
        <RadioButton
          id="ar-4-3"
          value="4:3"
          name="aspectRatio"
          onChange={changeAspectRatio}
          checked={prefs.aspectRatio === '4:3'}
        />
        <RadioButton
          id="ar-16-9"
          value="16:9"
          name="aspectRatio"
          onChange={changeAspectRatio}
          checked={prefs.aspectRatio === '16:9'}
        />
      </td>
    </tr>
  </Fragment>;
};

// A styled radio input which looks like a button.
const RadioButton = ({ id, value, checked, name, onChange, label }) => {
  return <Fragment>
    <input
      type="radio"
      onChange={e => onChange(e.target.value)}
      {...{ id, value, checked, name }}
      sx={{
        display: 'none',
        '&+label': {
          border: theme => `2px solid ${theme.colors.gray[0]}`,
          p: '1px 4px',
          borderRadius: '6px',
          mx: 1,
        },
        '&:checked+label': {
          bg: 'gray.0',
          color: 'white',
        },
      }}
    />
    <label htmlFor={id}>{ label || value }</label>
  </Fragment>;
};
