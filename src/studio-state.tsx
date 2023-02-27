//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { createContext, useReducer } from 'react';
import { isDisplayCaptureSupported, isUserCaptureSupported, usePresentContext } from './util';


export const AUDIO_SOURCE_MICROPHONE = 'microphone';
export const AUDIO_SOURCE_NONE = 'none';
export type AudioSource = 'microphone' | 'none';

export const VIDEO_SOURCE_BOTH = 'both';
export const VIDEO_SOURCE_DISPLAY = 'display';
export const VIDEO_SOURCE_USER = 'user';
export const VIDEO_SOURCE_NONE = 'none';
export type VideoSource = 'both' | 'display' | 'user' | 'none';

export const STATE_NOT_UPLOADED = 'not_uploaded';
export const STATE_UPLOADING = 'uploading';
export const STATE_UPLOADED = 'uploaded';
export const STATE_ERROR = 'error';
export type UploadState = 'not_uploaded' | 'uploading' | 'uploaded' | 'error';


export type Recording = {
  deviceType: 'desktop' | 'video',
  media: Blob,
  url: string,
  mimeType: string,
  dimensions: [number, number] | null,
  downloaded?: boolean,
};

/** Our global state */
export type StudioState = {
  mediaDevices: MediaDeviceInfo[],

  audioAllowed: null | boolean,
  audioStream: null | MediaStream,
  audioUnexpectedEnd: boolean,
  audioSupported: boolean,

  displayAllowed: null | boolean,
  displayStream: null | MediaStream,
  displayUnexpectedEnd: boolean,
  displaySupported: boolean,

  userAllowed: null | boolean,
  userStream: null | MediaStream,
  userUnexpectedEnd: boolean,
  userSupported: boolean,

  videoChoice: VideoSource,
  audioChoice: AudioSource,

  isRecording: boolean,
  prematureRecordingEnd: boolean,
  recordings: Recording[],

  title: string,
  presenter: string,

  start: null | number,
  end: null | number,

  series: null | string,

  upload: {
    error: null | string,
    state: UploadState,
    secondsLeft: null | number,
    currentProgress: number,
  },
};

const initialState = (): StudioState => ({
  mediaDevices: [],

  audioAllowed: null,
  audioStream: null,
  audioUnexpectedEnd: false,
  audioSupported: isUserCaptureSupported(),

  displayAllowed: null,
  displayStream: null,
  displayUnexpectedEnd: false,
  displaySupported: isDisplayCaptureSupported(),

  userAllowed: null,
  userStream: null,
  userUnexpectedEnd: false,
  userSupported: isUserCaptureSupported(),

  videoChoice: VIDEO_SOURCE_NONE,
  audioChoice: AUDIO_SOURCE_NONE,

  isRecording: false,
  prematureRecordingEnd: false,
  recordings: [],

  title: '',
  presenter: '',

  start: null,
  end: null,

  series: null,

  upload: {
    error: null,
    state: STATE_NOT_UPLOADED,
    secondsLeft: null,
    currentProgress: 0,
  },
});

/** Every possible action that can be passed to the reducer. */
type ReducerAction =
  | { type: 'UPDATE_MEDIA_DEVICES', devices: MediaDeviceInfo[] }
  | { type: 'CHOOSE_AUDIO', choice: AudioSource }
  | { type: 'CHOOSE_VIDEO', choice: VideoSource }
  | { type: 'SHARE_AUDIO', stream: MediaStream }
  | { type: 'BLOCK_AUDIO' }
  | { type: 'UNSHARE_AUDIO' }
  | { type: 'AUDIO_UNEXPETED_END' }
  | { type: 'SHARE_DISPLAY', stream: MediaStream }
  | { type: 'BLOCK_DISPLAY' }
  | { type: 'UNSHARE_DISPLAY' }
  | { type: 'DISPLAY_UNEXPETED_END' }
  | { type: 'SHARE_USER', stream: MediaStream }
  | { type: 'BLOCK_USER' }
  | { type: 'UNSHARE_USER' }
  | { type: 'USER_UNEXPETED_END' }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'STOP_RECORDING_PREMATURELY' }
  | { type: 'CLEAR_RECORDINGS' }
  | { type: 'ADD_RECORDING', recording: Recording }
  | { type: 'UPLOAD_ERROR', msg: string }
  | { type: 'UPLOAD_REQUEST' }
  | { type: 'UPLOAD_SUCCESS' }
  | { type: 'UPLOAD_PROGRESS_UPDATE', secondsLeft: number | null, currentProgress: number }
  | { type: 'MARK_DOWNLOADED', index: number }
  | { type: 'UPDATE_TITLE', value: string }
  | { type: 'UPDATE_PRESENTER', value: string }
  | { type: 'UPDATE_START', time: number | null }
  | { type: 'UPDATE_END', time: number | null }
  | { type: 'UPDATE_SERIES', value: string | null }
  | { type: 'RESET' };


const reducer = (state: StudioState, action: ReducerAction): StudioState => {
  switch (action.type) {
    case 'UPDATE_MEDIA_DEVICES': return { ...state, mediaDevices: action.devices };
    case 'CHOOSE_AUDIO': return { ...state, audioChoice: action.choice };
    case 'CHOOSE_VIDEO': return { ...state, videoChoice: action.choice };

    case 'SHARE_AUDIO': return {
      ...state,
      audioStream: action.stream,
      audioAllowed: true,
      audioUnexpectedEnd: false,
    };
    case 'BLOCK_AUDIO':
      return { ...state, audioStream: null, audioAllowed: false, audioUnexpectedEnd: false };
    case 'UNSHARE_AUDIO': return { ...state, audioStream: null, audioUnexpectedEnd: false };
    case 'AUDIO_UNEXPETED_END': return { ...state, audioStream: null, audioUnexpectedEnd: true };

    case 'SHARE_DISPLAY': return {
      ...state,
      displayStream: action.stream,
      displayAllowed: true,
      displayUnexpectedEnd: false,
    };
    case 'BLOCK_DISPLAY':
      return { ...state, displayStream: null, displayAllowed: false, displayUnexpectedEnd: false };
    case 'UNSHARE_DISPLAY':
      return { ...state, displayStream: null, displayUnexpectedEnd: false };
    case 'DISPLAY_UNEXPETED_END':
      return { ...state, displayStream: null, displayUnexpectedEnd: true };

    case 'SHARE_USER':
      return { ...state, userStream: action.stream, userAllowed: true, userUnexpectedEnd: false };
    case 'BLOCK_USER':
      return { ...state, userStream: null, userAllowed: false, userUnexpectedEnd: false };
    case 'UNSHARE_USER':
      return { ...state, userStream: null, userUnexpectedEnd: false };
    case 'USER_UNEXPETED_END':
      return { ...state, userStream: null, userUnexpectedEnd: true };

    case 'START_RECORDING': return { ...state, isRecording: true };
    case 'STOP_RECORDING': return { ...state, isRecording: false };
    case 'STOP_RECORDING_PREMATURELY':
      return { ...state, isRecording: false, prematureRecordingEnd: true };
    case 'CLEAR_RECORDINGS':
      return { ...state, recordings: [], prematureRecordingEnd: false };
    case 'ADD_RECORDING':
      // We remove all recordings with the same device type as the new one. This
      // *should* in theory never happen as all recordings are cleared before
      // new ones can be added. However, in rare case, this might not be true
      // and the user ends up with strange recordings. Just to be sure, we
      // remove old recordings here.
      const recordings = [
        ...state.recordings.filter(r => r.deviceType !== action.recording.deviceType),
        action.recording,
      ];
      return { ...state, recordings };

    case 'UPLOAD_ERROR':
      return { ...state, upload: { ...state.upload, error: action.msg, state: STATE_ERROR }};
    case 'UPLOAD_REQUEST':
      return { ...state, upload: { ...state.upload, error: null, state: STATE_UPLOADING }};
    case 'UPLOAD_SUCCESS':
      return { ...state, upload: { ...state.upload, error: null, state: STATE_UPLOADED }};
    case 'UPLOAD_PROGRESS_UPDATE':
      return { ...state, upload: {
        ...state.upload,
        secondsLeft: action.secondsLeft,
        currentProgress: action.currentProgress,
      }};

    case 'MARK_DOWNLOADED': return {
      ...state,
      recordings: state.recordings.map((recording, index) => (
        index === action.index ? { ...recording, downloaded: true } : recording
      )),
    };
    case 'UPDATE_TITLE': return { ...state, title: action.value };
    case 'UPDATE_PRESENTER': return { ...state, presenter: action.value };
    case 'UPDATE_START': return { ...state, start: action.time };
    case 'UPDATE_END': return { ...state, end: action.time };
    case 'UPDATE_SERIES': return { ...state, series: action.value };

    case 'RESET': return initialState();

    default: throw new Error();
  }
};

export type Dispatcher = (action: ReducerAction) => void;

const stateContext = createContext<StudioState | null>(null);
const dispatchContext = createContext<Dispatcher | null>(null);

export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState());

  return (
    <dispatchContext.Provider value={dispatch}>
      <stateContext.Provider value={state}>{children}</stateContext.Provider>
    </dispatchContext.Provider>
  );
};

/** Hook to get the `dispatch` function in order to change the global studio state. */
export const useDispatch = (): Dispatcher => usePresentContext(dispatchContext, 'useDispatch');

/** Hook to get access to the global Studio state. */
export const useStudioState = (): StudioState => usePresentContext(stateContext, 'useStudioState');
