//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex } from '@theme-ui/components';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useRecordingState } from '../../../recording-context';

import { PromptAndProceed } from '../elements';

import MediaDevices from './media-devices';
import RecordingControls from './recording-controls';
import Warnings from './warnings';

export default function Recording(props) {
  const { t } = useTranslation();
  const state = useRecordingState();

  useEffect(() => {
    if (!(state.displayStream || state.userStream)) {
      props.firstStep();
    }
  }, [props, state.displayStream, state.userStream]);

  const handleRecorded = () => {
    props.nextStep();
  };

  const backToSetupVideo = useCallback(() => {
    props.firstStep();
  }, [props]);

  const BackButton = ({ handlePrev }) => (
    <Button onClick={handlePrev}>
      <FontAwesomeIcon icon={faCaretLeft} />
      {t('back-button-label')}
    </Button>
  );

  const overlayStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    bg: 'videoOverlay'
  };

  return (
    <Flex as="main" sx={{ flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Box sx={{ ...overlayStyle, top: 0, pl: 2 }}>
        <PromptAndProceed prev={<BackButton handlePrev={backToSetupVideo} />} />
        <Warnings />
      </Box>

      <MediaDevices />

      <RecordingControls handleRecorded={handleRecorded} />
    </Flex>
  );
}
