// Everything related to video stream preferences that the user can modify.

//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, useColorMode } from 'theme-ui';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCog } from '@fortawesome/free-solid-svg-icons';
import useResizeObserver from 'use-resize-observer/polyfilled';

import { Settings, useSettings } from '../../../settings';
import { getUniqueDevices } from '../../../util';
import { useDispatch, useStudioState } from '../../../studio-state';
import {
  startDisplayCapture,
  startUserCapture,
  stopDisplayCapture,
  stopUserCapture
} from '../capturer';
import Tooltip from '../../Tooltip';


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
export const prefsToConstraints = (prefs: CameraPrefs | DisplayPrefs, exactDevice = false) => {
  const deviceConstraint = 'deviceId' in prefs
    && { deviceId: { [exactDevice ? 'exact' : 'ideal']: prefs.deviceId }};

  const aspectRatioConstraint = 'aspectRatio' in prefs
    && { aspectRatio: { ideal: parseAspectRatio(prefs.aspectRatio) }};

  const heightConstraint = 'quality' in prefs
    && { height: { ideal: parseQuality(prefs.quality) }};

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
const qualityOptions = (maxHeight: number) => {
  const defaults = [360, 480, 720, 1080, 1440, 2160];
  let out = defaults.filter(q => !maxHeight || q <= maxHeight);
  if (maxHeight && (out.length === 0 || out[out.length - 1] !== maxHeight)) {
    out.push(maxHeight);
  }

  return out.map(n => `${n}p`);
};

// Converts the given aspect ratio label (one of the elements in
// `ASPECT_RATIOS`) into the numerical ratio, e.g. 4/3 = 1.333. If the argument
// is not a valid label, `null` is returned.
const parseAspectRatio = (label: string) => {
  const mapping = {
    '4:3': 4 / 3,
    '16:9': 16 / 9,
  };

  return (mapping as Record<string, number>)[label] ?? null;
};

// Converts the given quality label to the actual height as number. If the
// argument is not a valid quality label (e.g. '720p'), `null` is returned.
const parseQuality = (label: string) => {
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

type CameraPrefs = {
  deviceId?: string;
  aspectRatio?: string;
  quality?: string;
};

type DisplayPrefs = {
  quality?: string;
};

// Loads the initial camera preferences from local storage.
export const loadCameraPrefs = (): CameraPrefs => ({
  deviceId: window.localStorage.getItem(LAST_VIDEO_DEVICE_KEY) ?? undefined,
  aspectRatio: window.localStorage.getItem(CAMERA_ASPECT_RATIO_KEY) || 'auto',
  quality: window.localStorage.getItem(CAMERA_QUALITY_KEY) || 'auto',
});

// Loads the initial display preferences from local storage.
export const loadDisplayPrefs = (): DisplayPrefs => ({
  quality: window.localStorage.getItem(DISPLAY_QUALITY_KEY) || 'auto',
});

type StreamSettingsProps = {
  isDesktop: boolean;
  stream: MediaStream;
}

export const StreamSettings: React.FC<StreamSettingsProps> = ({ isDesktop, stream }) => {
  const dispatch = useDispatch();
  const settings = useSettings();
  const [expandedHeight, setExpandedHeight] = useState(0);
  const ref = useRef<HTMLDivElement>();
  useResizeObserver<HTMLDivElement>({
    ref,

    // We don't use the height passed to the callback as we want the outer
    // height. We also add a magic "4" here. 2 pixels are for the border of the
    // outer div. The other two are "wiggle room". If we always set the height
    // to fit exactly, this easily leads to unnessecary scrollbars appearing.
    // This in turn might lead to rewrapping and then a change in height, in
    // the worst case ending up in an infinite loop.
    onResize: () => setExpandedHeight(ref.current?.offsetHeight + 4),
  });
  const { t } = useTranslation();

  // The current preferences and the callback to update them.
  const prefs = isDesktop ? loadDisplayPrefs() : loadCameraPrefs();
  const updatePrefs = (newPrefs: CameraPrefs | DisplayPrefs) => {
    // Merge and update preferences.
    const merged = { ...prefs, ...newPrefs };
    const constraints = prefsToConstraints(merged, true);

    const setOpt = (key: string, v: string | undefined) => {
      if (v != null) {
        window.localStorage.setItem(key, v);
      }
    };

    // Update preferences in local storage and re-request stream. The latter
    // will cause the rerender.
    if (isDesktop) {
      setOpt(DISPLAY_QUALITY_KEY, merged.quality);

      stopDisplayCapture(stream, dispatch);
      startDisplayCapture(dispatch, settings, constraints);
    } else {
      setOpt(LAST_VIDEO_DEVICE_KEY, (merged as Record<string, string>)["deviceId"]);
      setOpt(CAMERA_ASPECT_RATIO_KEY, (merged as Record<string, string>)["aspectRatio"]);
      setOpt(CAMERA_QUALITY_KEY, merged.quality);

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
  const [colorMode] = useColorMode();

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
        color: colorMode === 'dark' ? 'gray.3' : 'gray.1',
        backgroundColor: 'white',
        borderRadius: '10px',
        p: 1,
        fontSize: '18px',
      }}>
        {streamInfo(stream)}
      </span>
    </div>
    <div sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <div sx={{ textAlign: 'right' }}>
        <Tooltip offset={[0, 25]} content={isExpanded ? t('video-settings-close') : t('video-settings-open') }>
          <button
            onClick={() => setIsExpanded(old => !old)}
            sx={{
              border: 'none',
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
              '&:hover > svg, &:focus > svg': {
                transform: isExpanded ? 'none' : 'rotate(45deg)',
              },
              '&:focus-visible': {
                outline: theme => `5px solid ${theme.colors.primary}`,
                outlineOffset: '-2px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
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
          </button>
        </Tooltip>
      </div>
      <div sx={{
        height: isExpanded ? (expandedHeight || 'auto') : 0,
        flex: '0 1 auto',
        transition: 'height 0.2s',
        overflow: 'hidden',
        backgroundColor: 'background',
        fontSize: '18px',
        boxShadow: isExpanded ? '0 0 15px rgba(0, 0, 0, 0.3)' : 'none',
      }}>
        <div tabIndex={-1} sx={{
          border: theme => `1px solid ${theme.colors.gray[0]}`,
          height: '100%',
          overflow: 'auto',
        }}>
          <div ref={ref} sx={{ p: 1, pb: '2px' }}>
            <div sx={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'auto 1fr',
              gridGap: '6px 12px',
              p: 1,
            }} >
              { !isDesktop && <UserSettings {...{ updatePrefs, prefs, isExpanded }} /> }
              <UniveralSettings {...{ isDesktop, updatePrefs, prefs, stream, settings, isExpanded }} />
            </div>

            <div sx={{
              backgroundColor: 'gray.4',
              m: 2,
              py: 1,
              px: 2,
              fontSize: '16px',
              lineHeight: '20px',
              border: theme => `1px solid ${theme.colors.gray[2]}`,
            }}>
              <Trans i18nKey="sources-video-preferences-note">
                <strong>Note:</strong> Explanation.
              </Trans>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Fragment>;
};

const streamInfo = (stream: MediaStream) => {
  const s = stream?.getVideoTracks()?.[0]?.getSettings();
  const sizeInfo = (s && s.width && s.height) ? `${s.width}×${s.height}` : '';
  const fpsInfo = (s && s.frameRate) ? `${s.frameRate} fps` : '';

  return s ? [sizeInfo, fpsInfo].join(', ') : '...';
};

const PrefKey: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div sx={{
    gridColumn: '0 1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    hyphens: 'auto',
  }}>
    { children }
  </div>
);
const PrefValue: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div tabIndex={-1}
    sx={{
      gridColumn: '1 2',
      overflowX: 'auto',
      lineHeight: '30px',
      '*:focus-visible': {
        outline: theme => `5px solid ${theme.colors.primary}`,
        outlineOffset: '-3px',
      }
    }}>
    { children }
  </div>
);

type UniveralSettingsProps = {
  isDesktop: boolean;
  updatePrefs: (p: CameraPrefs | DisplayPrefs) => void;
  prefs: CameraPrefs | DisplayPrefs;
  settings: Settings;
  isExpanded: boolean;
};

const UniveralSettings: React.FC<UniveralSettingsProps> = (
  { isDesktop, updatePrefs, prefs, settings, isExpanded }
) => {
  const { t } = useTranslation();

  const changeQuality = (quality: string) => updatePrefs({ quality });
  const maxHeight = isDesktop ? settings.display?.maxHeight : settings.camera?.maxHeight;
  const qualities = qualityOptions(maxHeight);
  const kind = isDesktop ? 'desktop' : 'user';

  return <Fragment>
    <PrefKey>{t('sources-video-quality')}*:</PrefKey>
    <PrefValue>
      <RadioButton
        isExpanded={isExpanded}
        id={`quality-auto-${kind}`}
        value="auto"
        name={`quality-${kind}`}
        label={t('sources-video-quality-auto')}
        onChange={changeQuality}
        checked={qualities.every(q => prefs.quality !== q)}
      />
      {
        qualities.map(q => <Fragment key={`${q}-${kind}`}>
          <wbr />
          <RadioButton
            isExpanded={isExpanded}
            id={`quality-${q}-${kind}`}
            value={q}
            name={`quality-${kind}`}
            onChange={changeQuality}
            checked={prefs.quality === q}
          />
        </Fragment>)
      }
    </PrefValue>
  </Fragment>;
};

type UserSettingsProps = {
  updatePrefs: (p: CameraPrefs | DisplayPrefs) => void;
  prefs: CameraPrefs;
  isExpanded: boolean;
};


const UserSettings: React.FC<UserSettingsProps> = ({ updatePrefs, prefs, isExpanded }) => {
  const { t } = useTranslation();
  const state = useStudioState();

  const currentDeviceId = deviceIdOf(state.userStream);
  const devices = getUniqueDevices(state.mediaDevices, 'videoinput');

  const changeDevice = (id: string) => updatePrefs({ deviceId: id });
  const changeAspectRatio = (ratio: string) => updatePrefs({ aspectRatio: ratio });

  return <Fragment>
    <PrefKey>
      <label htmlFor="sources-video-device">{t('sources-video-device')}:</label>
    </PrefKey>
    <PrefValue>
      <select
        id="sources-video-device"
        tabIndex={isExpanded ? 0 : -1}
        sx={{ variant: 'styles.select' }}
        value={currentDeviceId}
        onChange={e => changeDevice(e.target.value)}
      >
        {
          devices.map((d, i) => (
            <option key={i} value={d.deviceId}>{ d.label }</option>
          ))
        }
      </select>
    </PrefValue>

    <PrefKey>{t('sources-video-aspect-ratio')}*:</PrefKey>
    <PrefValue>
      <RadioButton
        isExpanded={isExpanded}
        id="ar-auto"
        value="auto"
        name="aspectRatio"
        label={t('sources-video-aspect-ratio-auto')}
        onChange={changeAspectRatio}
        checked={ASPECT_RATIOS.every(x => prefs.aspectRatio !== x)}
      />
      {
        ASPECT_RATIOS.map(ar => <Fragment key={`ar-${ar}`}>
          <wbr />
          <RadioButton
            isExpanded={isExpanded}
            id={`ar-${ar}`}
            value={ar}
            name="aspectRatio"
            onChange={changeAspectRatio}
            checked={prefs.aspectRatio === ar}
          />
        </Fragment>)
      }
    </PrefValue>
  </Fragment>;
};

type RadioButtonProps = {
  id: string;
  name: string;
  value: string;
  isExpanded: boolean;
  checked: boolean;
  label?: string;
  onChange: (v: string) => void;
};

// A styled radio input which looks like a button.
const RadioButton: React.FC<RadioButtonProps> = ({
  id, value, checked, name, onChange, label, isExpanded
}) => {
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
          color: 'background',
          fontWeight: 'bold',
        }
      }}
    />
    <label
      tabIndex={isExpanded ? 0 : -1}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ' ) && onChange(value)}
      htmlFor={id}
    >{ label || value }</label>
  </Fragment>;
};

// Returns the devide ID of the video track of the given stream.
export const deviceIdOf = (stream: MediaStream | null) =>
  stream?.getVideoTracks()?.[0]?.getSettings()?.deviceId;
