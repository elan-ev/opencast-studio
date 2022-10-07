import { configure } from 'react-hotkeys'

/**
 * https://github.com/greena13/react-hotkeys
 * By default, all key events that originate from <input>, <select> or <textarea>, 
 * or have a isContentEditable attribute of true are ignored by react-hotkeys.
 */
configure({
  defaultKeyEvent: 'keydown',
  ignoreTags: ['input'],
  ignoreEventsCondition: function() {},
  ignoreKeymapAndHandlerChangesByDefault: false,
});

/**
 * Helper functions that rewrites keys based on the OS
*/
const getOs = () => {
  const os = ['Windows', 'Linux', 'Mac'];
  return os.find(v=>navigator.userAgent.indexOf(v) >= 0);
}

const rewriteKeys = (key) => {
  let newKey = key
  const os = getOs();

  if (os === 'Mac') {
    newKey = newKey.replace("Alt", "Option")
  }

  return newKey
}

// Groups for displaying shortcuts in the overview page
const recordGroup = 'record-shortcuts';
const editGroup = 'edit-shortcuts';
const otherGroup = 'other-shortcuts';

const back = 'backspace-key'
const enter = 'enter-key'
const del = 'delete-key'
const ctrl = 'control-key'
const shift = 'shift-key'
const space = 'space-key'
const left = 'left-key'
const right = 'right-key'

// Shortcuts for recording
export const recordShortcuts = {
  RECORD_DISPLAY: {
    name: 'record-display',
    sequences: ['d'],
    description: ['d'],
    group: recordGroup,
  },
  RECORD_CAMERA: {
    name: 'record-camera',
    sequences: ['c'],
    description: ['c'],
    group: recordGroup,
  },
  RECORD_DISPLAY_CAMERA: {
    name: 'record-both',
    sequences: ['b'],
    description: ['b'],
    group: recordGroup,
  },
  RECORD_AUDIO: {
    name: 'record-audio',
    sequences: ['y'],
    description: ['y'],
    group: recordGroup,
  },
  NO_AUDIO: {
    name: 'record-no-audio',
    sequences: ['n'],
    description: ['n'],
    group: recordGroup,
  },
  START_RECORDING: {
    name: 'start-recording',
    sequences: ['r'],
    description: ['r'],
    group: recordGroup,
  }, 
  STOP_RECORDING: {
    name: 'stop-recording',
    sequences: ['s'],
    description: ['s'],
    group: recordGroup,
  },
  PAUSE_RECORDING: {
    name: 'pause-recording',
    sequences: ['Space', 'k'],
    description: [space, 'k'],
    group: recordGroup,
  }
}

// Shortcuts for editing
export const editShortcuts = {
  PLAY_PAUSE: {
    name: 'play-pause',
    sequences: ['Space', 'k'],
    description: [space, 'k'],
    group: editGroup,
  },
  FORWARD_5_SEC: {
    name: 'skip-five',
    sequences: ['l', 'ArrowRight'],
    description: ['l', right],
    group: editGroup,
  },
  BACKWARDS_5_SEC: {
    name: 'back-five',
    sequences: ['j', 'ArrowLeft'],
    description: ['j', left],
    group: editGroup,
  },
  FORWARD_1_FRAME: {
    name: 'frame-forward',
    sequences: ['.'],
    description: ['.'],
    group: editGroup,
  },
  BACKWARDS_1_FRAME: {
    name: 'frame-back',
    sequences: [','],
    description: [','],
    group: editGroup,
  },
  CUT_LEFT: {
    name: 'cut-left',
    sequences: ['Shift+l'],
    description: [shift+'+l'],
    group: editGroup,
  },
  CUT_RIGHT: {
    name: 'cut-right',
    sequences: ['Shift+r'],
    description: [shift+'+r'],
    group: editGroup,
  },
  DELETE_CROP_MARK_LEFT: {
    name: 'delete-left',
    sequences: ['Shift+d', 'Shift+Delete'],
    description: [shift+'+d', shift+'+'+del],
    group: editGroup,
  },
  DELETE_CROP_MARK_RIGHT: {
    name: 'delete-right',
    sequences: ['d', 'Delete'],
    description: ['d', del],
    group: editGroup,
  }
}

export const otherShortcuts = {
  TAB: {
    name: 'tab-elements',
    sequences: [],
    description: ['Tab'],
    group: otherGroup,
  },
  NEXT_BUTTON: {
    name: 'next-button',
    sequences: ['Control+Enter'],
    description: [ctrl+'+'+enter],
    group: otherGroup,
  },
  BACK_BUTTON: {
    name: 'back-button',
    sequences: ['Control+Backspace'],
    description: [ctrl+'+'+back],
    group: otherGroup,
  },
  UPLOAD: {
    name: 'upload-video',
    sequences: [rewriteKeys('Alt+u')],
    description: [rewriteKeys('Alt+u')],
    group: otherGroup,
  },
  DOWNLOAD: {
    name: 'download-video',
    sequences: ['d'],
    description: ['d'],
    group: otherGroup,
  },
  NEW_RECORDING: {
    name: 'new-recording',
    sequences: ['Shift+n'],
    description: [shift+'+n'],
    group: otherGroup,
  }
}

export const getShortcuts = () => {
  const shortcutroups = [recordShortcuts, editShortcuts, otherShortcuts]
  const shortcuts = []

  for(const groups of shortcutroups) {
    for(const [key, value] of Object.entries(groups)) {

      shortcuts[key] = {
        name: value.name,
        sequences: value.sequences,
        description: value.description,
        group: value.group,
      }

    }
  }

  return shortcuts
}