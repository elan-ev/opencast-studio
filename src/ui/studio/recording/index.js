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

  return (
    <Flex sx={{
      flexDirection: 'column',
      height: '100%',
      position: 'relative',
      flexGrow: 1.
    }}>
      <Box sx={{ pl: 2, zIndex: 1, bg: 'videoOverlay' }}>
        <PromptAndProceed prev={<BackButton handlePrev={backToSetupVideo} />} />
      </Box>

      <MediaDevices />

      <RecordingControls handleRecorded={handleRecorded} />
    </Flex>
  );
}
