//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faChalkboard, faChalkboardTeacher, faUser } from '@fortawesome/free-solid-svg-icons';
import { Container, Flex } from '@theme-ui/components';
import { Styled } from 'theme-ui';
import { Fragment, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useDispatch, useRecordingState } from '../../../recording-context';

import Notification from '../../notification';

import { stopCapture } from '../capturer';
import { ActionButtons, Tab, Tabs, TabPanel } from '../elements';

import DisplayAndUserMedia from './display-and-user-media';
import DisplayMedia from './display-media';
import UserMedia from './user-media';

export default function VideoSetup(props) {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const state = useRecordingState();
  const { displayStream, userStream, displaySupported, userSupported } = state;

  const hasStreams = displayStream || userStream;
  const anySupported = displaySupported || userSupported;
  const bothSupported = displaySupported && userSupported;

  const BOTH = 'both';
  const DISPLAY = 'display';
  const USER = 'user';

  const tab =
    (displayStream && userStream && BOTH) ||
    (displayStream && DISPLAY) ||
    (userStream && USER) ||
    (bothSupported && BOTH) ||
    (displaySupported && DISPLAY) ||
    (userSupported && USER);
  const [activeTab, setActiveTab] = useState(tab);

  const handleTabChange = useCallback(
    (event, value) => {
      stopCapture(state, dispatch);
      setActiveTab(value);
    },
    [dispatch, state]
  );

  const chooseAudioSources = useCallback(() => {
    props.nextStep();
  }, [props]);

  const tabContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 1 auto',
    minHeight: 0
  };


  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
      }}
    >
      <Styled.h1 sx={{ textAlign: 'center', fontSize: ['26px', '30px', '32px'] }}>
        {t('sources-video-question')}
      </Styled.h1>

      { !anySupported && (
        <Notification isDanger>{t('sources-video-none-available')}</Notification>
      )}

      { anySupported && (
        <Flex
          sx={{
            flexDirection: ['column', 'row'],
            maxWidth: [270, 850],
            width: '100%',
            mx: ['auto', 'none'],
            mb: 3,
            flex: ['0 1 auto', '1 1 auto'],
            maxHeight: ['none', '270px'],
            minHeight: [0, ''],
            justifyContent: ['flex-start', 'center'],
            '& > :not(:last-of-type)': {
              mb: [3, 0],
              mr: [0, 3],
            },
          }}
        >
          { displaySupported && <OptionButton
            label={t('sources-scenario-display')}
            icon={faChalkboard}
          />}
          { bothSupported && <OptionButton
            label={t('sources-scenario-display-and-user')}
            icon={faChalkboardTeacher}
          />}
          { userSupported && <OptionButton
            label={t('sources-scenario-user')}
            icon={faUser}
          />}
        </Flex>
      )}


      <ActionButtons next={{ onClick: chooseAudioSources, disabled: !hasStreams }} />
    </Container>
  );
}

const OptionButton = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      sx={{
        fontFamily: 'inherit',
        color: 'gray.0',
        border: '2px solid black',
        borderRadius: '8px',
        flex: ['0 1 180px', '0 1 100%'],
        minWidth: '180px',
        maxWidth: '300px',
        minHeight: ['120px', '150px'],
        p: 2,
      }}
    >
      <div sx={{ display: 'block', textAlign: 'center', mb: 3 }}>
        <FontAwesomeIcon icon={icon} size="3x"/>
      </div>
      <div sx={{ fontSize: 4 }}>{label}</div>
    </button>
  );
};



      // {bothSupported && (
      //   <Tabs onChange={handleTabChange} value={activeTab}>
      //     <Tab
      //       icon={faChalkboardTeacher}
      //       label={t('sources-scenario-display-and-user')}
      //       value={BOTH}
      //     />
      //     <Tab icon={faChalkboard} label={t('sources-scenario-display')} value={DISPLAY} />
      //     <Tab icon={faUser} label={t('sources-scenario-user')} value={USER} />
      //   </Tabs>
      // )}

      // {!anySupported ? (
      //   <Notification isDanger>{t('studio-without-streams')}</Notification>
      // ) : (
      //   <Fragment>
      //     <TabPanel value={BOTH} index={activeTab} sx={tabContentStyle}>
      //       <DisplayAndUserMedia />
      //     </TabPanel>

      //     <TabPanel value={DISPLAY} index={activeTab} sx={tabContentStyle}>
      //       <DisplayMedia />
      //     </TabPanel>

      //     <TabPanel value={USER} index={activeTab} sx={tabContentStyle}>
      //       <UserMedia />
      //     </TabPanel>
      //   </Fragment>
      // )}
