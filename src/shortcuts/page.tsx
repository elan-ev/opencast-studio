//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { editShortcuts, otherShortcuts, recordShortcuts } from '.';
import { TranslationKey } from '../i18n';


/**
 * If a key should be displayed differently than their name in "sequences", its
 * translation key is listed here.
 */
const keyTranslations = {
  'Control': 'control-key',
  'Space': 'space-key',
  'ArrowRight': 'right-key',
  'ArrowLeft': 'left-key',
  'Shift': 'shift-key',
};

type AllShortcuts = typeof editShortcuts & typeof otherShortcuts & typeof recordShortcuts;

/** The translation keys for the labels of individual short cuts. */
const shortcutLabels: Record<keyof AllShortcuts, TranslationKey> = {
  RECORD_DISPLAY: 'record-display',
  RECORD_DISPLAY_CAMERA: 'record-both',
  RECORD_CAMERA: 'record-camera',
  RECORD_AUDIO: 'record-audio',
  NO_AUDIO: 'record-no-audio',
  START_RECORDING: 'start-recording',
  STOP_RECORDING: 'stop-recording',
  PAUSE_RECORDING: 'pause-recording',

  PLAY_PAUSE: 'play-pause',
  FORWARD_5_SEC: 'skip-five',
  BACKWARDS_5_SEC: 'back-five',
  FORWARD_1_FRAME: 'frame-forward',
  BACKWARDS_1_FRAME: 'frame-back',
  CUT_LEFT: 'cut-left',
  CUT_RIGHT: 'cut-right',
  DELETE_CROP_MARK_LEFT: 'delete-left',
  DELETE_CROP_MARK_RIGHT: 'delete-right',

  TAB: 'tab-elements',
  NEXT_BUTTON: 'next-button',
  BACK_BUTTON: 'back-button',
  UPLOAD: 'upload-video',
  DOWNLOAD: 'download-video',
  NEW_RECORDING: 'new-recording',
};

type GroupProps = {
  name: TranslationKey;
  keymap: Record<string, string[]>;
};

const Group: React.FC<GroupProps> = ({ name, keymap }) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      margin: '10px',
      display: 'flex',
      flexDirection: 'column',
      '@media screen and (max-width: 350px)': {
        width: '300px',
      }
    }}>
      <h3 sx={{
        borderBottom: theme => `1px solid ${theme.colorz.gray[1]}`,
        textAlign: 'center',
      }}>
        {t(name)}
      </h3>
      { Object.entries(keymap).map(([key, sequences], index) => (
        <Entry key={index} name={shortcutLabels[key]} sequences={sequences} />
      ))}
    </div>
  );
};



type EntryProps = {
  name: TranslationKey;
  sequences: string[],
};

const Entry: React.FC<EntryProps> = ({ name, sequences }) => {
  const { t } = useTranslation();

  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'row',
      padding: '6px 0',
      alignItems: 'center'
    }}>
      <div sx={{
        width: '40%',
        wordWrap: 'break-word',
      }}>
        {t(name)}
      </div>
      { sequences.map((sequence, index) => (
        <div key={index} sx={{ padding: '2px 0', display: 'flex' }}>
          { sequence.split('+').map((singleKey, index) => (
            <div key={index}
              sx={{
                borderRadius: '5px',
                border: theme => `2px solid ${theme.colorz.singleKey_border}`,
                background: theme => theme.colorz.singleKey_bg,
                padding: '8px',
                margin: '0 3px',
                textAlign: 'center',
                minWidth: '40px',
              }}>
              {singleKey in keyTranslations ? t(keyTranslations[singleKey]) : singleKey}
            </div>
          ))}
          <div sx={{ alignSelf: 'center', lineHeight: '32px', margin: '0 5px' }}>
            { sequences.length - 1 !== index && t("sequence-seperator") }
          </div>
        </div>
      ))}
    </div>
  );
};

const KeyboardShortcuts = () => {
  const { t } = useTranslation();

  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'center',
      width: '100%',
    }}>
    adsfad
      <h2 sx={{
        display: 'block',
        position: 'relative',
        textAlign: 'center',
      }}>
        {t('nav-shortcuts')}
      </h2>

      <div sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Group name="record-shortcuts" keymap={recordShortcuts} />
        <Group name="edit-shortcuts" keymap={editShortcuts} />
        <Group name="other-shortcuts" keymap={otherShortcuts} />
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
