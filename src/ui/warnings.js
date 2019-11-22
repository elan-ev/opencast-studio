//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Notification from './notification';
import {
  onSafari,
  isRecordingSupported,
} from "../util";

// Conditionally shows a number of warnings to help the user identify problems.
const Warnings = (props) => {
  const { t } = useTranslation();

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
    </React.Fragment>
  );
};

export default Warnings;
