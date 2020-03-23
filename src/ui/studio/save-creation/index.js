//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUpload, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { Button, Box, Container, Spinner, Text } from '@theme-ui/components';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

import { useOpencast, STATE_INCORRECT_LOGIN } from '../../../opencast';
import { useSettings } from '../../../settings';
import {
  metaData,
  useDispatch,
  useStudioState,
  STATE_ERROR,
  STATE_UPLOADING,
  STATE_UPLOADED,
  STATE_NOT_UPLOADED,
} from '../../../studio-state';

import Notification from '../../notification';
import {  } from '../page';
import { ActionButtons } from '../elements';

import FormField from './form-field';
import RecordingPreview from './recording-preview';


const Input = props => <input sx={{ variant: 'styles.input' }} {...props} />;

export default function SaveCreation(props) {
  const location = useLocation();
  const settings = useSettings();
  const { t } = useTranslation();
  const opencast = useOpencast();
  const { recordings, upload: uploadState } = useStudioState();
  const dispatch = useDispatch();

  function handleBack() {
    props.previousStep();
  }

  function handleInputChange(event) {
    const target = event.target;
    metaData[target.name] = target.value;
  }

  async function handleUpload() {
    const { title, presenter } = metaData;

    if (title === '' || presenter === '') {
      dispatch({ type: 'UPLOAD_ERROR', payload: t('save-creation-form-invalid') });
      return;
    }

    dispatch({ type: 'UPLOAD_REQUEST' });
    const workflowId = settings.upload?.workflowId;
    const seriesId = settings.upload?.seriesId;
    const success = await opencast.upload({
      recordings: recordings.filter(Boolean),
      title,
      creator: presenter,
      workflowId,
      seriesId,
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
    const doIt = window.confirm(t('save-creation-new-recording-warning'));
    if (doIt) {
      dispatch({ type: 'RESET' });
      props.firstStep();
    }
  };

  const allDownloaded = recordings.every(rec => rec.downloaded);
  const possiblyDone = uploadState.state === STATE_UPLOADED || allDownloaded;

  const uploadPossible = opencast.isReadyToUpload();

  let uploadBox;
  if (uploadState.state === STATE_NOT_UPLOADED && !uploadPossible) {
    uploadBox = (
      <Notification key="opencast-connection" isDanger>
        <Trans i18nKey="warning-missing-connection-settings">
          Warning.
          <Link
            to={{ pathname: "/settings", search: location.search }}
            sx={{ variant: 'styles.a', color: '#ff2' }}
          >
            settings
          </Link>
        </Trans>
      </Notification>
    );
  } else if (uploadState.state === STATE_UPLOADED) {
    uploadBox = (
      <React.Fragment>
        <div sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '130px',
          color: 'primary',
        }}>
          <FontAwesomeIcon icon={faCheckCircle} size="4x" />
        </div>
        <Text sx={{ textAlign: 'center' }}>{t('message-upload-complete')}</Text>
        <Text sx={{ textAlign: 'center', mt: 2 }}>{t('message-upload-complete-explanation')}</Text>
      </React.Fragment>
    );
  } else {
    uploadBox = (
      <React.Fragment>
        <FormField label={t('save-creation-label-title')}>
          <Input
            name="title"
            autoComplete="off"
            defaultValue={metaData.title}
            onChange={handleInputChange}
            disabled={uploadState.state === STATE_UPLOADING}
          />
        </FormField>

        <FormField label={t('save-creation-label-presenter')}>
          <Input
            name="presenter"
            autoComplete="off"
            defaultValue={metaData.presenter}
            onChange={handleInputChange}
            disabled={uploadState.state === STATE_UPLOADING}
          />
        </FormField>

        <Button
          onClick={handleUpload}
          disabled={recordings.length === 0 || uploadState.state === STATE_UPLOADING}
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
        { uploadState.state === STATE_UPLOADING && (
          <Spinner size="40" sx={{ verticalAlign: 'middle', ml: 3 }}/>
        )}
        <Box sx={{ mt: 2 }}>
        {
          (() => { switch (uploadState.state) {
            case STATE_ERROR:
              return <Notification isDanger>{uploadState.error}</Notification>;
            case STATE_UPLOADING:
              return <Notification>{t('upload-notification')}</Notification>;
            default:
              return null;
          }})()
        }
        </Box>
      </React.Fragment>
    );
  }

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        { possiblyDone ? t('save-creation-title-done') : t('save-creation-title') }
      </Styled.h1>

      <div sx={{
        display: 'flex',
        flexDirection: ['column', 'column', 'row'],
        '& > *': {
          flex: '1 0 50%',
          p: [2, 2, '0 32px'],
          '&:last-child': {
            borderLeft: ['none', 'none', theme => `1px solid ${theme.colors.gray[3]}`],
          },
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
            justifyContent: ['center', 'center', 'start'],
            flexWrap: 'wrap',
          }}>
            {recordings.length === 0 ? <Spinner /> : (
              recordings.map((recording, index) => (
                <RecordingPreview
                  key={index}
                  deviceType={recording.deviceType}
                  mimeType={recording.mimeType}
                  url={recording.url}
                  downloaded={recording.downloaded}
                  onDownload={() => dispatch({ type: 'MARK_DOWNLOADED', payload: index })}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div sx={{ flex: '1 0 40px' }}></div>

      <ActionButtons
        next={null}
        prev={possiblyDone ? null : {
          onClick: handleBack,
          disabled: false,
        }}
      >
        { !possiblyDone ? null : (
          <Button
            sx={{ whiteSpace: 'nowrap' }}
            onClick={handleNewRecording}
          >
            <FontAwesomeIcon icon={faRedoAlt} />
            {t('save-creation-new-recording')}
          </Button>
        )}
      </ActionButtons>
    </Container>
  );
}
