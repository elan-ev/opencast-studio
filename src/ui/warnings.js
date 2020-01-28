//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';

import Notification from './notification';
import OpencastAPI from '../opencast-api';
import {
  onSafari,
  isRecordingSupported,
} from "../util";

// Conditionally shows a number of warnings to help the user identify problems.
const Warnings = ({ settings }) => {
  const { t } = useTranslation();

  let warnings = [];

  // We allow HTTP connections to localhost, as most browsers also seem to allow
  // video capture in those cases.
  const usingUnsecureConnection = window.location.protocol !== 'https:' &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
  if (usingUnsecureConnection) {
    warnings.push(
        <Notification key="unsecure-connection" isDanger>{t('warning-https')}</Notification>
    );
  }

  // Warning about missing `MediaRecorder` support
  if (!isRecordingSupported()) {
    warnings.push(
      <Notification key="media-recorder" isDanger>
        {t('warning-recorder-not-supported')}
        {onSafari() && ' ' + t('warning-recorder-safari-hint')}
      </Notification>
    );
  }

  // Warn if the user has not yet configured the Opencast connection
  if (!OpencastAPI.areSettingsComplete(settings.opencast)) {
    warnings.push(
      <Notification key="opencast-connection" isDanger>
        {t('warning-missing-connection-settings')}
      </Notification>
    );
  }


  return warnings.length > 0
    ? <div sx={{ p: 3 }}>{ warnings }</div>
    : null;
};

export default Warnings;
