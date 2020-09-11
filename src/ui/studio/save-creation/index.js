//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled, Progress } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faUpload,
  faRedoAlt,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button, Box, Container, Spinner, Text } from '@theme-ui/components';
import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import useForm from 'react-hook-form';
import { usePageVisibility } from 'react-page-visibility';

import {
  useOpencast,
  STATE_UNCONFIGURED,
  STATE_CONNECTED,
  STATE_NETWORK_ERROR,
  STATE_INCORRECT_LOGIN,
  STATE_RESPONSE_NOT_OK,
  STATE_INVALID_RESPONSE,
  UPLOAD_SUCCESS,
  UPLOAD_NETWORK_ERROR,
  UPLOAD_NOT_AUTHORIZED,
  UPLOAD_UNEXPECTED_RESPONSE,
} from '../../../opencast';
import { useSettings, FORM_FIELD_HIDDEN, FORM_FIELD_REQUIRED } from '../../../settings';
import {
  useDispatch,
  useStudioState,
  STATE_ERROR,
  STATE_UPLOADING,
  STATE_UPLOADED,
  STATE_NOT_UPLOADED,
} from '../../../studio-state';

import Notification from '../../notification';
import { ActionButtons } from '../elements';
import { Input } from '../../elements';

import RecordingPreview from './recording-preview';


const LAST_PRESENTER_KEY = 'ocStudioLastPresenter';

let progressHistory = [];

export default function SaveCreation(props) {
  const settings = useSettings();
  const { t } = useTranslation();
  const opencast = useOpencast();
  const { recordings, upload: uploadState, title, presenter, start, end } = useStudioState();
  const dispatch = useDispatch();

  function handleBack() {
    props.previousStep();
  }

  function onProgress(progress) {
    // ----- Time estimation -----
    // We use a simple sliding average over the last few data points and assume
    // that speed for the rest of the upload.
    const now = Date.now();

    // Add progress data point to history.
    progressHistory.push({
      timestamp: now,
      progress,
    });

    // The size of the sliding window in milliseconds.
    const WINDOW_SIZE_MS = 5000;
    // The size of the sliding window in number of data points.
    const WINDOW_SIZE_DATA_POINTS = 6;
    // The number of datapoints below which we won't show a time estimate.
    const MINIMUM_DATA_POINT_COUNT = 4;

    // Find the first element within the window. We use the larger window of the
    // two windows created by the two constraints (time and number of
    // datapoints).
    const windowStart = Math.min(
      progressHistory.findIndex(p => (now - p.timestamp) < WINDOW_SIZE_MS),
      Math.max(0, progressHistory.length - WINDOW_SIZE_DATA_POINTS),
    );

    // Remove all elements outside the window.
    progressHistory.splice(0, windowStart);

    let secondsLeft = null;
    if (progressHistory.length >= MINIMUM_DATA_POINT_COUNT) {
      // Calculate the remaining time based on the average speed within the window.
      const windowLength = now - progressHistory[0].timestamp;
      const progressInWindow = progress - progressHistory[0].progress;
      const progressPerSecond = (progressInWindow / windowLength) * 1000;
      const progressLeft = 1 - progress;
      secondsLeft = Math.max(0, Math.round(progressLeft / progressPerSecond));
    }

    // Update state if anything changed. We actually check for equality here to
    // avoid useless redraws.
    if (uploadState.secondsLeft !== secondsLeft || uploadState.currentProgress !== progress) {
      dispatch({
        type: 'UPLOAD_PROGRESS_UPDATE',
        payload: { secondsLeft, currentProgress: progress },
      });
    }
  }

  useEffect(() => {
    // To still update the time estimation, we make sure to call `onProgress` at
    // least every so often.
    const interval = setInterval(() => {
      if (uploadState.state !== STATE_UPLOADING) {
        return;
      }

      if (!progressHistory.length) {
        onProgress(0);
      } else {
        const lastProgress = progressHistory[progressHistory.length - 1];
        const timeSinceLastUpdate = Date.now() - lastProgress.timestamp;
        if (timeSinceLastUpdate > 3000) {
            onProgress(lastProgress.progress);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  async function handleUpload() {
    dispatch({ type: 'UPLOAD_REQUEST' });
    progressHistory.push({
      timestamp: Date.now(),
      progress: 0,
    });
    const result = await opencast.upload({
      recordings: recordings.filter(Boolean),
      title,
      presenter,
      start,
      end,
      uploadSettings: settings.upload,
      onProgress,
    });
    progressHistory = [];

    switch (result) {
      case UPLOAD_SUCCESS:
        dispatch({ type: 'UPLOAD_SUCCESS' });
        break;
      case UPLOAD_NETWORK_ERROR:
        dispatch({ type: 'UPLOAD_ERROR', payload: t('save-creation-upload-network-error') });
        break;
      case UPLOAD_NOT_AUTHORIZED:
        dispatch({ type: 'UPLOAD_ERROR', payload: t('save-creation-upload-not-authorized') });
        break;
      case UPLOAD_UNEXPECTED_RESPONSE:
        dispatch({ type: 'UPLOAD_ERROR', payload: t('save-creation-upload-invalid-response') });
        break;
      default: // including UPLOAD_UNKNOWN_ERROR
        dispatch({ type: 'UPLOAD_ERROR', payload: t('save-creation-upload-unknown-error') });
    }
  }

  const allDownloaded = recordings.every(rec => rec.downloaded);
  const possiblyDone = (uploadState.state === STATE_UPLOADED || allDownloaded)
    && uploadState.state !== STATE_UPLOADING;
  const hideBack = uploadState.state !== STATE_NOT_UPLOADED || allDownloaded;

  // Depending on the state, show a different thing in the upload box.
  const uploadBox = (() => {
    const showUnconfiguredWarning = uploadState.state === STATE_NOT_UPLOADED
      && (opencast.getState() === STATE_UNCONFIGURED || opencast.getState() === STATE_CONNECTED);
    if (showUnconfiguredWarning) {
      return <ConnectionUnconfiguredWarning />;
    }

    switch (uploadState.state) {
      case STATE_UPLOADING:
        return <UploadProgress
          currentProgress={uploadState.currentProgress}
          secondsLeft={uploadState.secondsLeft}
        />;
      case STATE_UPLOADED:
        return <UploadSuccess />;
      default: // STATE_NOT_UPLOADED or STATE_ERROR
        return <UploadForm {...{ uploadState, handleUpload }} />
    }
  })();

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        { possiblyDone ? t('save-creation-title-done') : t('save-creation-title') }
      </Styled.h1>

      <div sx={{
        display: 'flex',
        flexDirection: ['column', 'column', 'row'],
        '& > *': {
          flex: ['0', '0', '1 0 50%'],
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

          <DownloadBox dispatch={dispatch} {...{ title, presenter }} />
        </div>
      </div>

      <div sx={{ flex: '1 0 32px' }}></div>

      <ActionButtons
        next={null}
        prev={hideBack ? null : {
          onClick: handleBack,
          disabled: false,
        }}
      >
        { possiblyDone && <PostAction
          goToFirstStep={props.firstStep}
        />}
      </ActionButtons>
    </Container>
  );
}

const PostAction = ({ goToFirstStep }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const settings = useSettings();

  const handleNewRecording = () => {
    const doIt = window.confirm(t('save-creation-new-recording-warning'));
    if (doIt) {
      dispatch({ type: 'RESET' });
      goToFirstStep();
    }
  };

  let returnAction;
  if (settings.return?.target) {
    if (isAllowedReturnTarget(settings)) {
      const label = settings.return?.label
        ? t('save-creation-return-to', { label: settings.return.label })
        : t('save-creation-return-to-no-label');

      returnAction = (
        <Button
          as='a'
          title={label}
          href={settings.return.target}
          sx={{ whiteSpace: 'nowrap', fontWeight: 400, mb: 2 }}
        >
          <FontAwesomeIcon icon={faTimesCircle} />
          { label }
        </Button>
      );
    } else {
      console.warn("the given 'return.target' is not allowed "
        + "(check 'return.allowedDomains' in 'settings.toml')");
    }
  }

  return (
    <div sx={{ display: 'flex', flexDirection: 'column' }}>
      { returnAction }

      <Button
        sx={{ whiteSpace: 'nowrap' }}
        title={t('save-creation-new-recording')}
        onClick={handleNewRecording}
      >
        <FontAwesomeIcon icon={faRedoAlt} />
        {t('save-creation-new-recording')}
      </Button>
    </div>
  );
};

const isAllowedReturnTarget = settings => {
  let targetUrl;
  try {
    targetUrl = new URL(settings.return.target, window.location);
  } catch (e) {
    return false;
  }

  const allowedDomains = [window.location.hostname, ...(settings.return?.allowedDomains || [])];
  return allowedDomains.some(domain => targetUrl.hostname === domain)
    && (targetUrl.protocol === 'https:' || targetUrl.protocol === 'http:');
};

const DownloadBox = ({ presenter, title }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { recordings, start, end } = useStudioState();

  return (
    <Fragment>
      { (start !== null || end !== null) && (
        <Notification sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FontAwesomeIcon icon={faExclamationTriangle} sx={{ fontSize: '26px', mb: 3 }} />
          <p sx={{ m: 0 }}>{ t('save-creation-download-cut-warning') }</p>
        </Notification>
      )}
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
              recording={recording}
              presenter={presenter}
              title={title}
              onDownload={() => dispatch({ type: 'MARK_DOWNLOADED', payload: index })}
            />
          ))
        )}
      </div>
    </Fragment>
  );
}

// Shown if there is no working Opencast connection. Shows a warning and a link
// to settings.
const ConnectionUnconfiguredWarning = () => {
  const location = useLocation();

  return (
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
};

const UploadForm = ({ uploadState, handleUpload }) => {
  const {
    titleField = FORM_FIELD_REQUIRED,
    presenterField = FORM_FIELD_REQUIRED,
  } = useSettings().upload || {};

  const { t } = useTranslation();
  const opencast = useOpencast();
  const dispatch = useDispatch();
  const { recordings, title, presenter } = useStudioState();
  const presenterValue = presenter || window.localStorage.getItem(LAST_PRESENTER_KEY) || '';

  const { errors, handleSubmit, register } = useForm();

  // This is a bit ugly, but works. We want to make sure that the `title` and
  // `presenter` values in the studio state always equal the current value in
  // the input.
  function handleInputChange(event) {
    const target = event.target;
    dispatch({
      type: { title: 'UPDATE_TITLE', presenter: 'UPDATE_PRESENTER' }[target.name],
      payload: target.value,
    });

    if (target.name === 'presenter') {
      window.localStorage.setItem(LAST_PRESENTER_KEY, target.value);
    }
  }

  // If the user has not yet changed the value of the field and the last used
  // presenter name is used in local storage, use that.
  useEffect(() => {
    if (presenterValue !== presenter) {
      dispatch({ type: 'UPDATE_PRESENTER', payload: presenterValue });
    }
  });

  const buttonLabel = !opencast.prettyServerUrl()
    ? t('save-creation-button-upload')
    : (
      <Trans i18nKey="save-creation-upload-to">
        Upload to <code sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '5px',
          padding: '1px 3px',
        }}>{{server: opencast.prettyServerUrl()}}</code>
      </Trans>
    );

  return (
    <Fragment>
      <NotConnectedWarning />

      <form>
        { titleField !== FORM_FIELD_HIDDEN && <Input
          name="title"
          label={t('save-creation-label-title')}
          required={titleField === FORM_FIELD_REQUIRED}
          onChange={handleInputChange}
          autoComplete="off"
          defaultValue={title}
          {...{ errors, register }}
        /> }

        { presenterField !== FORM_FIELD_HIDDEN && <Input
          name="presenter"
          label={t('save-creation-label-presenter')}
          required={presenterField === FORM_FIELD_REQUIRED}
          onChange={handleInputChange}
          autoComplete="off"
          defaultValue={presenterValue}
          {...{ errors, register }}
        /> }

        <Button
          title={t('save-creation-button-upload')}
          disabled={recordings.length === 0}
          onClick={handleSubmit(handleUpload)}
        >
          <FontAwesomeIcon icon={faUpload} />
          { buttonLabel }
        </Button>
      </form>

      <Box sx={{ mt: 2 }}>
        { uploadState.state === STATE_ERROR && (
          <Notification isDanger>{uploadState.error}</Notification>
        )}
      </Box>
    </Fragment>
  );
};

const NotConnectedWarning = () => {
  const location = useLocation();
  const opencast = useOpencast();
  const { t } = useTranslation();
  const isVisible = usePageVisibility();

  // In an error state, we are retrying every 5 seconds. We only busy poll if
  // the page is actually active to not waste resources.
  const [retrying, setRetrying] = useState(false);
  useEffect(() => {
    if (!opencast.isReadyToUpload() && !retrying && isVisible) {
      const id = setTimeout(async () => {
        setRetrying(true);
        await opencast.refreshConnection();
        setRetrying(false);
      }, 5000);

      return () => clearTimeout(id);
    }
  })

  // If the connection is established, we don't show the warning.
  if (opencast.isReadyToUpload()) {
    return null;
  }

  // Piece together the warning message depending on the situation.
  let problem;
  let onceResolved;
  switch (opencast.getState()) {
    case STATE_NETWORK_ERROR:
      problem = t('save-creation-warn-unreachable');
      onceResolved = t('save-creation-warn-once-reestablished');
      break;
    case STATE_INCORRECT_LOGIN:
      if (opencast.isLoginProvided()) {
        const referrer = document.referrer;
        problem = (
          <Trans i18nKey='save-creation-warn-session-expired'>
            Foo
            {
              (referrer && !referrer.includes(window.origin || ''))
                ? <Styled.a href={referrer} target='_blank' sx={{ color: '#ff2' }}>bar</Styled.a>
                : <Fragment>bar</Fragment>
            }
            baz
          </Trans>
        );
        t('save-creation-warn-session-expired');
        onceResolved = t('save-creation-warn-once-refreshed');
      } else {
        problem = (
          <Trans i18nKey='save-creation-warn-login-failed'>
            Failed.
            <Link
              to={{ pathname: "/settings", search: location.search }}
              sx={{ variant: 'styles.a', color: '#ff2' }}
            >
              settings
            </Link>
          </Trans>
        );
        onceResolved = t('save-creation-warn-once-logged-in');
      }
      break;
    case STATE_RESPONSE_NOT_OK:
    case STATE_INVALID_RESPONSE:
      problem = t('save-creation-warn-server-problem')
        + ' ' + t('save-creation-warn-download-hint');
      break;
    default:
      problem = 'Internal error :-(';
  }

  return (
    <Notification isDanger>
      <div sx={{ textAlign: 'center', fontSize: '40px', lineHeight: 1.3 }}>
        { retrying
          ? <Spinner size='40' />
          : <FontAwesomeIcon icon={faExclamationTriangle} />
        }
      </div>
      <p sx={{ mb: 0 }}>{ problem }</p>
      { onceResolved && (
        <p sx={{ mb: 0 }}>
          { onceResolved }
          { onceResolved && ' ' }
          { t('save-creation-warn-download-hint') }
        </p>
      )}
    </Notification>
  );
};

// Shown during upload. Shows a progressbar, the percentage of data already
// uploaded and `secondsLeft` nicely formatted as human readable time.
const UploadProgress = ({ currentProgress, secondsLeft }) => {
  const { t, i18n } = useTranslation();

  // Progress as percent with one fractional digit, e.g. 27.3%.
  const roundedPercent = Math.min(100, currentProgress * 100).toLocaleString(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // Nicely format the remaining time.
  let prettyTime;
  if (secondsLeft === null) {
    prettyTime = null;
  } else if (secondsLeft < 4) {
    prettyTime = t('upload-time-a-few-seconds');
  } else if (secondsLeft < 45) {
    prettyTime = `${secondsLeft} ${t('upload-time-seconds')}`;
  } else if (secondsLeft < 90) {
    prettyTime = t('upload-time-a-minute');
  } else if (secondsLeft < 45 * 60) {
    prettyTime = `${Math.round(secondsLeft / 60)} ${t('upload-time-minutes')}`;
  } else if (secondsLeft < 90 * 60) {
    prettyTime = t('upload-time-an-hour');
  } else if (secondsLeft < 24 * 60 * 60) {
    prettyTime = `${Math.round(secondsLeft / (60 * 60))} ${t('upload-time-hours')}`;
  } else {
    prettyTime = null;
  }

  return (
    <Fragment>
      <div sx={{ display: 'flex', mb: 2 }}>
        <Text variant='text'>{roundedPercent}%</Text>
        <div sx={{ flex: 1 }} />
        <Text variant='text'>
          {prettyTime && <Trans i18nKey="upload-time-left">
            {{ time: prettyTime }} left
          </Trans>}
        </Text>
      </div>
      <Progress max={1} value={currentProgress} variant='styles.progress'>
        { roundedPercent }
      </Progress>
      <Text variant='text' sx={{ textAlign: 'center', mt: 2 }}>{t('upload-notification')}</Text>
    </Fragment>
  );
};

// Shown if the upload was successful. A big green checkmark and a text.
const UploadSuccess = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <div sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '130px',
        color: 'primary',
      }}>
        <FontAwesomeIcon icon={faCheckCircle} size="4x" />
      </div>
      <Text variant='text' sx={{ textAlign: 'center' }}>{t('message-upload-complete')}</Text>
      <Text sx={{ textAlign: 'center', mt: 2 }}>{t('message-upload-complete-explanation')}</Text>
    </Fragment>
  );
};
