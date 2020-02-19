//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { Flex, Spinner } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';
import { Beforeunload } from 'react-beforeunload';

import { ActionButtons } from '../elements';
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

  return (
    <div
      sx={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: 0,
        overflow: 'hidden',
        // This magic ratio is just a "works well enough" value. Most videos
        // will be 16:9 and this leads to good space usage in those cases.
        '@media (max-aspect-ratio: 10/7)': {
          flexDirection: 'column',
        },
      }}
    >
      {recordings.length === 0 ? (
        <Spinner title={t('save-creation-waiting-for-recordings')} />
      ) : (
        recordings.map((recording, index) => (
          <div
            key={index}
            sx={{
              flex: '1 0 50%',
              width: '100%',
              overflow: 'hidden',
              p: 1,
            }}
          >
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
          </div>
        ))
      )}
    </div>
  );
};
