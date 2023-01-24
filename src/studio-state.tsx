//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { createContext, useContext, useReducer } from 'react';
import { isDisplayCaptureSupported, isUserCaptureSupported } from './util';


export const AUDIO_SOURCE_MICROPHONE = 'microphone';
export const AUDIO_SOURCE_NONE = 'none';

export const VIDEO_SOURCE_BOTH = 'both';
export const VIDEO_SOURCE_DISPLAY = 'display';
export const VIDEO_SOURCE_USER = 'user';
export const VIDEO_SOURCE_NONE = 'none';

export const STATE_NOT_UPLOADED = 'not_uploaded';
export const STATE_UPLOADING = 'uploading';
export const STATE_UPLOADED = 'uploaded';
export const STATE_ERROR = 'error';


const initialState = () => ({
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

  upload: {
    error: null,
    state: STATE_NOT_UPLOADED,
    secondsLeft: null,
    currentProgress: 0,
  },
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_MEDIA_DEVICES':
      return { ...state, mediaDevices: action.payload };

    case 'CHOOSE_AUDIO':
      return { ...state, audioChoice: action.payload };

    case 'CHOOSE_VIDEO':
      return { ...state, videoChoice: action.payload };

    case 'SHARE_AUDIO':
      return {
        ...state,
        audioStream: action.payload,
        audioAllowed: true,
        audioUnexpectedEnd: false,
      };

    case 'BLOCK_AUDIO':
      return { ...state, audioStream: null, audioAllowed: false, audioUnexpectedEnd: false };

    case 'UNSHARE_AUDIO':
      return { ...state, audioStream: null, audioUnexpectedEnd: false };

    case 'AUDIO_UNEXPETED_END':
      return { ...state, audioStream: null, audioUnexpectedEnd: true };

    case 'SHARE_DISPLAY':
      return {
        ...state,
        displayStream: action.payload,
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
      return { ...state, userStream: action.payload, userAllowed: true, userUnexpectedEnd: false };

    case 'BLOCK_USER':
      return { ...state, userStream: null, userAllowed: false, userUnexpectedEnd: false };

    case 'UNSHARE_USER':
      return { ...state, userStream: null, userUnexpectedEnd: false };

    case 'USER_UNEXPETED_END':
      return { ...state, userStream: null, userUnexpectedEnd: true };

    case 'START_RECORDING':
      return { ...state, isRecording: true };

    case 'STOP_RECORDING':
      return { ...state, isRecording: false };

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
        ...state.recordings.filter(r => r.deviceType !== action.payload.deviceType),
        action.payload,
      ];
      return { ...state, recordings };

    case 'UPLOAD_ERROR':
      return { ...state, upload: { ...state.upload, error: action.payload, state: STATE_ERROR }};

    case 'UPLOAD_REQUEST':
      return { ...state, upload: { ...state.upload, error: null, state: STATE_UPLOADING }};

    case 'UPLOAD_SUCCESS':
      return { ...state, upload: { ...state.upload, error: null, state: STATE_UPLOADED }};

    case 'UPLOAD_PROGRESS_UPDATE':
      return { ...state, upload: {
        ...state.upload,
        secondsLeft: action.payload.secondsLeft,
        currentProgress: action.payload.currentProgress,
      }};

    case 'MARK_DOWNLOADED':
      const mapped = state.recordings.map((recording, index) => (
        index === action.payload ? { ...recording, downloaded: true } : recording
      ));
      return { ...state, recordings: mapped };

    case 'UPDATE_TITLE':
      return { ...state, title: action.payload };

    case 'UPDATE_PRESENTER':
      return { ...state, presenter: action.payload };

    case 'UPDATE_START':
      return { ...state, start: action.payload };

    case 'UPDATE_END':
      return { ...state, end: action.payload };

    case 'RESET':
      return initialState();

    default:
      throw new Error();
  }
};

const stateContext = createContext(null);
const dispatchContext = createContext(null);

export const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState());

  return (
    <dispatchContext.Provider value={dispatch}>
      <stateContext.Provider value={state}>{children}</stateContext.Provider>
    </dispatchContext.Provider>
  );
};

export const useDispatch = () => useContext(dispatchContext);

export const useStudioState = (property = null) => {
  const state = useContext(stateContext);
  return property !== null ? state[property] : state;
};
