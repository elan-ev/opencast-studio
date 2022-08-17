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

export const keyMap = {
  // Shortcuts for recording
    RECORD_DISPLAY: {
      name: 'record-display',
      sequences: ['d'],
      description: ['d'],
      action: 'keydown',
      group: recordGroup,
    },
    RECORD_CAMERA: {
      name: 'record-camera',
      sequences: ['c'],
      description: ['c'],
      action: 'keydown',
      group: recordGroup,
    },
    RECORD_DISPLAY_CAMERA: {
      name: 'record-both',
      sequences: ['b'],
      description: ['b'],
      action: 'keydown',
      group: recordGroup,
    },
    RECORD_AUDIO: {
      name: 'record-audio',
      sequences: ['y'],
      description: ['y'],
      action: 'keydown',
      group: recordGroup,
    },
    NO_AUDIO: {
      name: 'record-no-audio',
      sequences: ['n'],
      description: ['n'],
      action: 'keydown',
      group: recordGroup,
    },
    START_RECORDING: {
      name: 'start-recording',
      sequences: ['r'],
      description: ['r'],
      action: 'keydown',
      group: recordGroup,
    }, 
    STOP_RECORDING: {
      name: 'stop-recording',
      sequences: ['s'],
      description: ['s'],
      action: 'keydown',
      group: recordGroup,
    },
    PAUSE_RECORDING: {
      name: 'pause-recording',
      sequences: ['Space', 'k'],
      description: [space, 'k'],
      action: 'keydown',
      group: recordGroup,
    },

  // Shortcuts for editing
    PLAY_PAUSE: {
      name: 'play-pause',
      sequences: ['Space', 'k'],
      description: [space, 'k'],
      action: 'keydown',
      group: editGroup,
    },
    FORWARD_5_SEC: {
      name: 'skip-five',
      sequences: ['l', 'ArrowRight'],
      description: ['l', right],
      action: 'keydown',
      group: editGroup,
    },
    BACKWARDS_5_SEC: {
      name: 'back-five',
      sequences: ['j', 'ArrowLeft'],
      description: ['j', left],
      action: 'keydown',
      group: editGroup,
    },
    FORWARD_1_FRAME: {
      name: 'frame-forward',
      sequences: ['.'],
      description: ['.'],
      action: 'keydown',
      group: editGroup,
    },
    BACKWARDS_1_FRAME: {
      name: 'frame-back',
      sequences: [','],
      description: [','],
      action: 'keydown',
      group: editGroup,
    },
    CUT_LEFT: {
      name: 'cut-left',
      sequences: ['Shift+l'],
      description: [shift+'+l'],
      action: 'keydown',
      group: editGroup,
    },
    CUT_RIGHT: {
      name: 'cut-right',
      sequences: ['Shift+r'],
      description: [shift+'+r'],
      action: 'keydown',
      group: editGroup,
    },
    DELETE_CROP_MARK_LEFT: {
      name: 'delete-left',
      sequences: ['Shift+d', 'Shift+Delete'],
      description: [shift+'+d', shift+'+'+del],
      action: 'keydown',
      group: editGroup,
    },
    DELETE_CROP_MARK_RIGHT: {
      name: 'delete-right',
      sequences: ['d', 'Delete'],
      description: ['d', del],
      action: 'keydown',
      group: editGroup,
    },

  // Other Shortcuts
    TAB: {
      name: 'tab-elements',
      sequences: [],
      description: ['Tab'],
      action: 'keydown',
      group: otherGroup,
    },
    NEXT_BUTTON: {
      name: 'next-button',
      sequences: ['Control+Enter'],
      description: [ctrl+'+'+enter],
      action: 'keydown',
      group: otherGroup,
    },
    BACK_BUTTON: {
      name: 'back-button',
      sequences: ['Control+Backspace'],
      description: [ctrl+'+'+back],
      action: 'keydown',
      group: otherGroup,
    },
    UPLOAD: {
      name: 'upload-video',
      sequences: ['Control+u'],
      description: [ctrl+'+u'],
      action: 'keydown',
      group: otherGroup,
    },
    DOWNLOAD: {
      name: 'download-video',
      sequences: ['d'],
      description: ['d'],
      action: 'keydown',
      group: otherGroup,
    },
    NEW_RECORDING: {
      name: 'new-recording',
      sequences: ['Shift+n'],
      description: [shift+'+n'],
      action: 'keydown',
      group: otherGroup,
    }
}
