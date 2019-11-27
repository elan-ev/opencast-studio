//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Notification from './notification';
import {
  onSafari,
  isRecordingSupported,
} from "../util";

// Conditionally shows a number of warnings to help the user identify problems.
const Warnings = () => {
  const { t } = useTranslation();

  // We allow HTTP connections to localhost, as most browsers also seem to allow
  // video capture in those cases.
  const usingUnsecureConnection = window.location.protocol !== 'https:' &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  return (
    <React.Fragment>
      {!isRecordingSupported() && (
        <div sx={{ p: 3 }}>
          <Notification isDanger>
            {t('warning-recorder-not-supported')}
            {onSafari() && ' ' + t('warning-recorder-safari-hint')}
          </Notification>
        </div>
      )}

      { usingUnsecureConnection && (
        <div sx={{ p: 3 }}>
          <Notification isDanger>
            {t('warning-https')}
          </Notification>
        </div>
      )}
    </React.Fragment>
  );
};

export default Warnings;
