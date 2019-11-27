//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { createContext, useContext, useReducer } from 'react';
import { isDisplayCaptureSupported, isUserCaptureSupported } from './util';

const initialState = () => ({
  audioAllowed: null,
  audioStream: null,
  audioSupported: isUserCaptureSupported(),

  displayAllowed: null,
  displayStream: null,
  displaySupported: isDisplayCaptureSupported(),

  userAllowed: null,
  userStream: null,
  userSupported: isUserCaptureSupported(),

  recordings: []
});

const reducer = (state, action) => {
  switch (action.type) {
    case 'SHARE_AUDIO':
      return { ...state, audioStream: action.payload, audioAllowed: true };

    case 'BLOCK_AUDIO':
      return { ...state, audioStream: null, audioAllowed: false };

    case 'UNSHARE_AUDIO':
      return { ...state, audioStream: null };

    case 'SHARE_DISPLAY':
      return { ...state, displayStream: action.payload, displayAllowed: true };

    case 'BLOCK_DISPLAY':
      return { ...state, displayStream: null, displayAllowed: false };

    case 'UNSHARE_DISPLAY':
      return { ...state, displayStream: null };

    case 'SHARE_USER':
      return { ...state, userStream: action.payload, userAllowed: true };

    case 'BLOCK_USER':
      return { ...state, userStream: null, userAllowed: false };

    case 'UNSHARE_USER':
      return { ...state, userStream: null };

    case 'ADD_RECORDING':
      return { ...state, recordings: [...state.recordings, action.payload] };

    case 'CLEAR_RECORDINGS':
      return { ...state, recordings: [] };

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

export const useRecordingState = (property = null) => {
  const state = useContext(stateContext);
  return property !== null ? state[property] : state;
};
