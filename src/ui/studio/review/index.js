//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Flex, Spinner } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';
import { Beforeunload } from 'react-beforeunload';

import { ActionButtons, VideoBox } from '../elements';
import { useRecordingState } from '../../../recording-context';


export default function Review(props) {
  const { t } = useTranslation();

  const handleBack = () => {
    props.previousStep();
  };

  const handleNext = () => {
    props.nextStep();
  };

  return (
    <Flex
      sx={{
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        padding: 3,
      }}
    >
      <Beforeunload onBeforeunload={event => event.preventDefault()} />

      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        {t('review-heading')}
      </Styled.h1>

      <Preview />

      <div sx={{ mb: 3 }}></div>

      <ActionButtons
        prev={{ onClick: handleBack }}
        next={{ onClick: handleNext }}
      />
    </Flex>
  );
};

const Preview = () => {
  const { recordings } = useRecordingState();
  const { t } = useTranslation();

  if (recordings.length === 0) {
    return <Spinner title={t('save-creation-waiting-for-recordings')} />;
  }

  const children = recordings.map((recording, index) => ({
    body: (
      <video
        key={index}
        controls
        src={recording.url}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#ccc',
          outline: 'none'
        }}
      ></video>
    ),
    aspectRatio: recording.aspectRatio,
  }));

  return <VideoBox gap={20}>{ children }</VideoBox>;
};
