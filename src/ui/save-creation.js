//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

import { Button } from '@theme-ui/components';
import FormField from './form-field';
import RecordingPreview from './recording-preview';

const Input = props => <input sx={{ width: '100%' }} {...props} />;

function SaveCreationDialog(props) {
  const { t } = useTranslation();

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    props.setRecordingData({ ...props.recordingData, [name]: value });
  }

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}
    >
      <header>
        <h1 sx={{ fontWeight: 'heading' }}>Production details</h1>
      </header>

      <main sx={{ flex: 1 }}>
        <FormField label={t('save-creation-label-title')}>
          <Input
            name="title"
            autoComplete="off"
            value={props.recordingData.title}
            onChange={handleInputChange}
          />
        </FormField>

        <FormField label={t('save-creation-label-presenter')}>
          <Input
            name="presenter"
            autoComplete="off"
            value={props.recordingData.presenter}
            onChange={handleInputChange}
          />
        </FormField>
      </main>

      <header>
        <h1 sx={{ fontWeight: 'heading' }}>{t('save-creation-label-media')}</h1>
      </header>

      <main sx={{ flex: 1 }}>
        <div
          sx={{
            display: 'flex',
            maxHeight: '6.5rem',
            overflowY: 'auto',
            flexWrap: 'wrap'
          }}
        >
          {props.desktopRecording && (
            <RecordingPreview
              deviceType="desktop"
              title={props.recordingData.title}
              type="video"
              url={props.desktopRecording.url}
            />
          )}
          {props.videoRecording && (
            <RecordingPreview
              deviceType="video"
              title={props.recordingData.title}
              type="video"
              url={props.videoRecording.url}
            />
          )}
        </div>
      </main>

      <footer
        sx={{
          mt: 4,
          button: {
            minWidth: 100,
            width: ['100%', 'auto'],
            '& + button': {
              ml: [0, 2],
              mt: [2, 'auto']
            },
            '& svg': {
              mr: 2
            }
          }
        }}
      >
        <Button onClick={props.handleUpload}>
          <FontAwesomeIcon icon={faUpload} />
          <span>{t('save-creation-button-upload')}</span>
        </Button>

        <Button onClick={props.handleSave}>
          <FontAwesomeIcon icon={faDownload} />
          <span>{t('save-creation-button-save')}</span>
        </Button>

        <Button onClick={props.handleCancel}>
          <FontAwesomeIcon icon={faTrash} />
          <span>{t('save-creation-button-discard')}</span>
        </Button>
      </footer>
    </div>
  );
}

export default SaveCreationDialog;
