// Everything related to video stream preferences that the user can modify.

//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog } from '@fortawesome/free-solid-svg-icons';

import { useSettings } from '../../../settings';
import { deviceIdOf, dimensionsOf } from '../../../util.js';
import { useDispatch, useStudioState } from '../../../studio-state';
import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';


// Creates a valid constraints object from the given preferences. The mapping
// is as follows:
//
// - deviceId: falsy values are ignored, any other value is passed on, either as
//   `ideal` (if `exactDevice` is `false`) or `exact` (if `exactDevice` is
//   `true`).
// - aspectRatio: values in `ASPECT_RATIOS` are passed as `ideal`, everything
//   else is ignored.
// - quality: valid quality labels are passed on as `ideal` height, invalid ones
//   are ignored.
export const prefsToConstraints = (prefs, exactDevice = false) => {
  const deviceConstraint = prefs.deviceId
    && { deviceId: { [exactDevice ? 'exact' : 'ideal']: prefs.deviceId }};

  const aspectRatio = parseAspectRatio(prefs.aspectRatio);
  const aspectRatioConstraint = aspectRatio && { aspectRatio: { ideal: aspectRatio }};

  const height = parseQuality(prefs.quality);
  const heightConstraint = height && { height: { ideal: height }};

  return {
    ...deviceConstraint,
    ...aspectRatioConstraint,
    ...heightConstraint,
  };
};

// All aspect ratios the user can choose from.
const ASPECT_RATIOS = ['4:3', '16:9'];

// All quality options given to the user respecting the `maxHeight` from the
// settings.
const qualityOptions = maxHeight => {
  const defaults = [480, 720, 1080, 1440, 2160];
  let out = defaults.filter(q => !maxHeight || q <= maxHeight);
  if (maxHeight && (out.length === 0 || out[out.length - 1] !== maxHeight)) {
    out.push(maxHeight);
  }

  return out.map(n => `${n}p`);
}

// Converts the given aspect ratio label (one of the elements in
// `ASPECT_RATIOS`) into the numerical ratio, e.g. 4/3 = 1.333. If the argument
// is not a valid label, `null` is returned.
const parseAspectRatio = label => {
  const mapping = {
    '4:3': 4 / 3,
    '16:9': 16 / 9,
  };

  return mapping[label] || null;
}

// Converts the given quality label to the actual height as number. If the
// argument is not a valid quality label (e.g. '720p'), `null` is returned.
const parseQuality = label => {
  if (!/^[0-9]+p$/.test(label)) {
    return null;
  }

  return parseInt(label);
};

// Local storage keys
const LAST_VIDEO_DEVICE_KEY = 'ocStudioLastVideoDevice';
const CAMERA_ASPECT_RATIO_KEY = 'ocStudioCameraAspectRatio';
const CAMERA_QUALITY_KEY = 'ocStudioCameraQuality';
const DISPLAY_QUALITY_KEY = 'ocStudioDisplayQuality';

// Loads the initial camera preferences from local storage.
export const loadCameraPrefs = () => ({
  deviceId: window.localStorage.getItem(LAST_VIDEO_DEVICE_KEY),
  aspectRatio: window.localStorage.getItem(CAMERA_ASPECT_RATIO_KEY) || 'auto',
  quality: window.localStorage.getItem(CAMERA_QUALITY_KEY) || 'auto',
});

// Loads the initial display preferences from local storage.
export const loadDisplayPrefs = () => ({
  quality: window.localStorage.getItem(DISPLAY_QUALITY_KEY) || 'auto',
});


export const StreamSettings = ({ isDesktop, stream }) => {
  const dispatch = useDispatch();
  const settings = useSettings();

  // The current preferences and the callback to update them.
  const prefs = isDesktop ? loadDisplayPrefs() : loadCameraPrefs();
  const updatePrefs = newPrefs => {
    // Merge and update preferences.
    const merged = { ...prefs, ...newPrefs };
    const constraints = prefsToConstraints(merged, true);

    // Update preferences in local storage and re-request stream. The latter
    // will cause the rerender.
    if (isDesktop) {
      window.localStorage.setItem(DISPLAY_QUALITY_KEY, merged.quality);

      stopDisplayCapture(stream, dispatch);
      startDisplayCapture(dispatch, settings, constraints);
    } else {
      window.localStorage.setItem(LAST_VIDEO_DEVICE_KEY, merged.deviceId);
      window.localStorage.setItem(CAMERA_ASPECT_RATIO_KEY, merged.aspectRatio);
      window.localStorage.setItem(CAMERA_QUALITY_KEY, merged.quality);

      stopUserCapture(stream, dispatch);
      startUserCapture(dispatch, settings, constraints);
    }
  };

  // Store the camera device ID in local storage. We also do this here, as we
  // also want to remember the device the user initially selected in the browser
  // popup.
  useEffect(() => {
    const cameraDeviceId = deviceIdOf(stream);
    if (!isDesktop && cameraDeviceId) {
      window.localStorage.setItem(LAST_VIDEO_DEVICE_KEY, cameraDeviceId);
    }
  });

  // State about expanding and hiding the settings.
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedHeight = useRef(null);

  return <Fragment>
    <div sx={{
      position: 'absolute',
      top: isExpanded ? '8px' : '-30px',
      left: 0,
      right: 0,
      textAlign: 'center',
      transition: 'top 0.2s',
    }}>
      <span sx={{
        color: 'gray.1',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '10px',
        p: 1,
      }}>
        <StreamInfo stream={stream} />
      </span>
    </div>
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
              <UniveralSettings {...{ isDesktop, updatePrefs, prefs, stream, settings }} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Fragment>;
};

const StreamInfo = ({ stream }) => {
  const s = stream?.getVideoTracks()?.[0]?.getSettings();
  const sizeInfo = (s && s.width && s.height) ? `${s.width}×${s.height}` : '';
  const fpsInfo = (s && s.frameRate) ? `${s.frameRate} fps` : '';

  return s ? [sizeInfo, fpsInfo].join(', ') : '...';
};

const UniveralSettings = ({ isDesktop, updatePrefs, prefs, stream, settings }) => {
  const { t } = useTranslation();

  const changeQuality = quality => updatePrefs({ quality });
  const maxHeight = isDesktop ? settings.display?.maxHeight : settings.camera?.maxHeight;
  const qualities = qualityOptions(maxHeight);
  const kind = isDesktop ? 'desktop' : 'user';

  const [, currentHeight] = dimensionsOf(stream);
  let fitState;
  if (currentHeight && qualities.includes(prefs.quality)) {
    const expectedHeight = parseInt(prefs.quality);
    fitState = expectedHeight === currentHeight ? 'ok': 'warn';
  }

  return <Fragment>
    <tr>
      <td>{t('sources-video-quality')}:</td>
      <td>
        <RadioButton
          id={`quality-auto-${kind}`}
          value="auto"
          name={`quality-${kind}`}
          label={t('sources-video-quality-auto')}
          onChange={changeQuality}
          checked={qualities.every(q => prefs.quality !== q)}
        />
        {
          qualities.map(q => <RadioButton
            key={`${q}-${kind}`}
            id={`quality-${q}-${kind}`}
            value={q}
            name={`quality-${kind}`}
            onChange={changeQuality}
            checked={prefs.quality === q}
            state={fitState}
          />)
        }
      </td>
    </tr>
  </Fragment>;
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

  const [width, height] = dimensionsOf(state.userStream);
  let arState;
  if (width && height && ASPECT_RATIOS.includes(prefs.aspectRatio)) {
    const currentAr = width / height;
    const expectedAr = parseAspectRatio(prefs.aspectRatio);

    // We have some range we accept as "good". You never know with these
    // floats...
    arState = (expectedAr * 0.97 < currentAr && currentAr < expectedAr / 0.97)
      ? 'ok'
      : 'warn';
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
          checked={ASPECT_RATIOS.every(x => prefs.aspectRatio !== x)}
        />
        {
          ASPECT_RATIOS.map(ar => <RadioButton
            id={`ar-${ar}`}
            key={`ar-${ar}`}
            value={ar}
            name="aspectRatio"
            onChange={changeAspectRatio}
            checked={prefs.aspectRatio === ar}
            state={arState}
          />)
        }
      </td>
    </tr>
  </Fragment>;
};

// A styled radio input which looks like a button.
const RadioButton = ({ id, value, checked, name, onChange, label, state }) => {
  const stateColorMap = {
    'warn': '#ffe300',
    'ok': '#51d18f',
  };

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
          color: state ? stateColorMap[state] : 'white',
          fontWeight: 'bold',
        },
      }}
    />
    <label htmlFor={id}>{ label || value }</label>
  </Fragment>;
};
