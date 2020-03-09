//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { Button, Box, Container, Spinner } from '@theme-ui/components';
import React, { useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';
import { Trans, useTranslation } from 'react-i18next';

import { useOpencast, STATE_INCORRECT_LOGIN } from '../../../opencast';
import { useDispatch, useRecordingState } from '../../../recording-context';

import Notification from '../../notification';
import { ActionButtons } from '../elements';

import FormField from './form-field';
import RecordingPreview from './recording-preview';

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
  const opencast = useOpencast();
  const recordingDispatch = useDispatch();
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleBack() {
    props.previousStep();
  }

  function handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    dispatch({ type: 'RECORDING_DATA_UPDATE', payload: [target.name, value] });
  }

  async function handleUpload() {
    const { title, presenter } = state.recordingData;

    if (title === '' || presenter === '') {
      dispatch({ type: 'ERROR', payload: t('save-creation-form-invalid') });
      return;
    }

    dispatch({ type: 'UPLOAD_REQUEST' });
    const success = await opencast.upload({
      recordings: recordings.filter(Boolean),
      title,
      creator: presenter,
    });

    if (success) {
      dispatch({ type: 'UPLOAD_SUCCESS' });
    } else {
      switch (opencast.getState()) {
        case STATE_INCORRECT_LOGIN:
          dispatch({ type: 'UPLOAD_FAILURE', payload: t('message-login-failed') });
          break;
        default:
          // TODO: this needs a better message and maybe some special cases.
          dispatch({ type: 'UPLOAD_FAILURE', payload: t('message-server-unreachable') });
          break;
      }
    }
  }

  const handleNewRecording = () => {
    recordingDispatch({ type: 'CLEAR_RECORDINGS' });
    props.firstStep();
  };

  const uploadPossible = opencast.isReadyToUpload();

  const uploadBox = uploadPossible
    ? (
      <React.Fragment>
        <FormField label={t('save-creation-label-title')}>
          <Input
            name="title"
            autoComplete="off"
            value={state.recordingData.title}
            onChange={handleInputChange}
            disabled={state.uploading || state.uploaded}
          />
        </FormField>

        <FormField label={t('save-creation-label-presenter')}>
          <Input
            name="presenter"
            autoComplete="off"
            value={state.recordingData.presenter}
            onChange={handleInputChange}
            disabled={state.uploading || state.uploaded}
          />
        </FormField>

        <Button
          onClick={handleUpload}
          disabled={recordings.length === 0 || state.uploading || state.uploaded}
        >
          <FontAwesomeIcon icon={faUpload} />
          {
            !opencast.prettyServerUrl() ? t('save-creation-button-upload') :
              <Trans i18nKey="save-creation-upload-to">
                Upload to <code sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '5px',
                  padding: '1px 3px',
                }}>{{server: opencast.prettyServerUrl()}}</code>
              </Trans>
          }
        </Button>
        <Box>
          {state.error && <Notification isDanger>{state.error}</Notification>}
          {state.uploading && <Notification>{t('upload-notification')}</Notification>}
          {state.uploaded && <Notification>{t('message-upload-complete')}</Notification>}
        </Box>
      </React.Fragment>
    ) : (
      <Notification key="opencast-connection" isDanger>
        <Trans i18nKey="warning-missing-connection-settings">
          Warning. <Link to="/settings" sx={{ variant: 'styles.a' }}>settings</Link>
        </Trans>
      </Notification>
    );

  return (
    <Container>
      {recordings.length > 0 && <Beforeunload onBeforeunload={event => event.preventDefault()} />}

      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        {t('save-creation-title')}
      </Styled.h1>

      <div sx={{
        display: 'flex',
        flexDirection: ['column', 'column', 'row'],
        '& > *': {
          flex: '1 0 50%',
          p: 2,
        },
      }}>
        <div>
          <Styled.h2
            sx={{ pb: 1, borderBottom: theme => `1px solid ${theme.colors.gray[2]}` }}
          >{t('save-creation-subsection-title-upload')}</Styled.h2>

          <div sx={{ margin: 'auto' }}>
            { uploadBox }
          </div>
        </div>

        <div>
          <Styled.h2
            sx={{ pb: 1, borderBottom: theme => `1px solid ${theme.colors.gray[2]}` }}
          >{t('save-creation-subsection-title-download')}</Styled.h2>

          <div sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {recordings.length === 0 ? <Spinner /> : (
              recordings.map((recording, index) => (
                <RecordingPreview
                  key={index}
                  deviceType={recording.deviceType}
                  title={state.recordingData.title}
                  type="video"
                  mimeType={recording.mimeType}
                  url={recording.url}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div sx={{ mb: '50px' }}></div>

      <ActionButtons
        next={null}
        prev={{
          onClick: handleBack,
          disabled: false,
        }}
      />
    </Container>
  );
}
