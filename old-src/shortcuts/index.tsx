import { configure, KeyMap } from 'react-hotkeys';

configure({
  defaultKeyEvent: 'keydown',
  ignoreKeymapAndHandlerChangesByDefault: false,
});

const getOs = () => {
  const os = ['Windows', 'Linux', 'Mac'];
  return os.find(v => navigator.userAgent.includes(v));
};

/** Helper functions that rewrites keys based on the OS. */
const rewriteKeys = (key: string) => getOs() === 'Mac' ? key.replace('Alt', 'Option') : key;

/** Shortcuts for recording */
export const recordShortcuts = {
  RECORD_DISPLAY: ['1'],
  RECORD_DISPLAY_CAMERA: ['2'],
  RECORD_CAMERA: ['3'],
  RECORD_AUDIO: ['1'],
  NO_AUDIO: ['2'],
  START_RECORDING: ['r'],
  STOP_RECORDING: ['s'],
  PAUSE_RECORDING: ['Space', 'k'],
} satisfies KeyMap;

/** Shortcuts for editing */
export const editShortcuts = {
  PLAY_PAUSE: ['Space', 'k'],
  FORWARD_5_SEC: ['l', 'ArrowRight'],
  BACKWARDS_5_SEC: ['j', 'ArrowLeft'],
  FORWARD_1_FRAME: ['.'],
  BACKWARDS_1_FRAME: [','],
  CUT_LEFT: ['n'],
  CUT_RIGHT: ['m'],
  DELETE_CROP_MARK_LEFT: ['Shift+n'],
  DELETE_CROP_MARK_RIGHT: ['Shift+m'],
} satisfies KeyMap;

export const otherShortcuts = {
  TAB: [],
  NEXT_BUTTON: ['Control+ArrowRight'],
  BACK_BUTTON: ['Control+ArrowLeft'],
  UPLOAD: [rewriteKeys('Alt+u')],
  DOWNLOAD: ['d'],
  NEW_RECORDING: ['Shift+n'],
} satisfies KeyMap;
