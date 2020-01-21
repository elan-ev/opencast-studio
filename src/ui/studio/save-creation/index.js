//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Button, Box, Container, Spinner } from '@theme-ui/components';
import { useReducer } from 'react';
import { Beforeunload } from 'react-beforeunload';
import { useTranslation } from 'react-i18next';

import downloadBlob from '../../../download-blob';
import OpencastAPI from '../../../opencast-api';
import { useRecordingState } from '../../../recording-context';

import Notification from '../../notification';

import { PromptAndProceed } from '../elements';

import FormField from './form-field';
import RecordingPreview from './recording-preview';

const getDownloadName = (deviceType, type, title) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
  return `${flavor} ${type} - ${title || 'Recording'}.webm`;
};

const Input = props => <input sx={{ variant: 'styles.input' }} {...props} />;

const initialState = {
  error: null,
  recordingData: { title: '', presenter: '' },
  uploading: false,
  uploaded: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ERROR':
      return { ...state, error: action.payload };

    case 'RECORDING_DATA_UPDATE':
      const [name, value] = action.payload;
      return { ...state, recordingData: { ...state.recordingData, [name]: value } };

    case 'UPLOAD_FAILURE':
      return { ...state, error: action.payload, uploading: false, uploaded: false };

    case 'UPLOAD_REQUEST':
      return { ...state, error: null, uploading: true, uploaded: false };

    case 'UPLOAD_SUCCESS':
      return { ...state, error: null, uploading: false, uploaded: true };

    default:
      throw new Error();
  }
};

export default function SaveCreation(props) {
  const { t } = useTranslation();
  const { recordings } = useRecordingState();
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    dispatch({ type: 'RECORDING_DATA_UPDATE', payload: [target.name, value] });
  }

  function handleSave() {
    recordings.forEach(recording => {
      const { deviceType, media } = recording;
      downloadBlob(media, getDownloadName(deviceType, 'video', state.recordingData.title));
    });
  }

  function handleUpload() {
    const { title, presenter } = state.recordingData;

    if (title === '' || presenter === '') {
      dispatch({ type: 'ERROR', payload: t('save-creation-form-invalid') });
      return;
    }

    dispatch({ type: 'UPLOAD_REQUEST' });
    new OpencastAPI(props.settings.opencast).loginAndUpload(
      // recording,
      recordings.filter(Boolean),

      function onSuccess() {
        dispatch({ type: 'UPLOAD_SUCCESS' });
      },

      function onLoginFailed() {
        dispatch({ type: 'UPLOAD_FAILURE', payload: t('message-login-failed') });
        // TODO: (mel) We have to find a better way to ensure connection to OC
        // this.props.handleOpenUploadSettings();
      },

      function onServerUnreachable(error) {
        dispatch({ type: 'UPLOAD_FAILURE', payload: t('message-server-unreachable') });
        // TODO: (mel) We have to find a better way to ensure connection to OC
        // this.props.handleOpenUploadSettings();
      },

      function onInetOrPermFailed(err) {
        dispatch({ type: 'UPLOAD_FAILURE', payload: t('message-conn-failed') });
        // TODO: (mel) We have to find a better way to ensure connection to OC
        // this.props.handleOpenUploadSettings();
      },
      title,
      presenter
    );
  }

  const handleCancel = () => {
    props.previousStep();
  };

  return (
    <Container>
      {recordings.length > 0 && <Beforeunload onBeforeunload={event => event.preventDefault()} />}

      <PromptAndProceed
        prev={
          <Button onClick={handleCancel}>
            <FontAwesomeIcon icon={faCaretLeft} />
            {t('back-button-label')}
          </Button>
        }
        sx={{ py: 3 }}
      >
        {t('save-creation-prompt')}
      </PromptAndProceed>

      <header>
        <h2 sx={{ fontWeight: 'heading' }}>{t('save-creation-modal-title')}</h2>
      </header>

      <Box>
        {state.error && <Notification isDanger>{state.error}</Notification>}
        {state.uploading && <Notification>{t('upload-notification')}</Notification>}
        {state.uploaded && <Notification>{t('message-upload-complete')}</Notification>}

        <FormField label={t('save-creation-label-title')}>
          <Input
            name="title"
            autoComplete="off"
            value={state.recordingData.title}
            onChange={handleInputChange}
          />
        </FormField>

        <FormField label={t('save-creation-label-presenter')}>
          <Input
            name="presenter"
            autoComplete="off"
            value={state.recordingData.presenter}
            onChange={handleInputChange}
          />
        </FormField>
      </Box>

      <header>
        <h2 sx={{ fontWeight: 'heading' }}>{t('save-creation-label-media')}</h2>
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
          {recordings.length === 0 ? (
            <Spinner title={t('save-creation-waiting-for-recordings')} />
          ) : (
            recordings.map((recording, index) => (
              <RecordingPreview
                key={index}
                deviceType={recording.deviceType}
                title={state.recordingData.title}
                type="video"
                url={recording.url}
              />
            ))
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
            }
          }
        }}
      >
        <Button
          onClick={handleUpload}
          disabled={recordings.length === 0 || state.uploading || state.uploaded}
        >
          <FontAwesomeIcon icon={faUpload} />
          <span>
            {state.uploading
              ? t('save-creation-button-uploading')
              : state.uploaded
              ? t('save-creation-button-uploaded')
              : t('save-creation-button-upload')}
          </span>
        </Button>

        <Button onClick={handleSave} disabled={!recordings.length}>
          <FontAwesomeIcon icon={faDownload} />
          <span>{t('save-creation-button-save')}</span>
        </Button>

        <Button onClick={handleCancel} variant="text">
          <FontAwesomeIcon icon={faTrash} />
          <span>{t('save-creation-button-discard')}</span>
        </Button>
      </footer>
    </Container>
  );
}
