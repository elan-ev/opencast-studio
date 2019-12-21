//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

// import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Flex } from '@theme-ui/components';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toggle from 'react-toggle';

import DeviceSelector from './device-selector';
import DisplayPreview from './preview';

import { stopAudioCapture, startAudioCapture } from './capturer';
import { useDispatch, useRecordingState } from '../../recording-context';

export default function SourceDisplayActive() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const displayStream = useRecordingState('displayStream');
  const videoRef = useRef();

  useEffect(() => {
    videoRef.current.srcObject = displayStream;

    return () => {};
  }, [displayStream]);

  const handleMicChange = ({ target }) => {
    (target.checked ? startAudioCapture : stopAudioCapture)(displayStream, dispatch);
  };

  const [devices, setDevices] = useState([]);

  const hasAudio = displayStream && displayStream.getAudioTracks().length > 0;

  const chooseAudioDevice = deviceId => {
    startAudioCapture(displayStream, dispatch, deviceId);
  };

  useEffect(() => {
    const enumerateAudioDevices = async () => {
      const devices = hasAudio
        ? (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput')
        : [];
      setDevices(devices);
    };

    enumerateAudioDevices(displayStream);
  }, [displayStream, hasAudio]);

  return (
    <Box>
      <DisplayPreview>
        <video
          ref={videoRef}
          autoPlay
          muted
          sx={{
            width: '100%',
            height: '100%',
            // TODO: (mel) cover or contain?
            objectFit: 'contain'
            // TODO: (mel) research this setting
            // transform: 'rotateY(180deg)'
          }}
        />
      </DisplayPreview>

      <Box sx={{ px: 2, mt: 5 }}>
        <Styled.h3>{t('options')}</Styled.h3>
        <Flex sx={{ alignItems: 'center' }}>
          <label>
            <Toggle
              checked={hasAudio}
              onChange={handleMicChange}
              sx={{ mr: 2, verticalAlign: 'middle' }}
            />
            <span sx={{ verticalAlign: 'middle' }}>{t('source-display-add-mic')}</span>
          </label>

          {hasAudio && (
            <Fragment>
              <Box sx={{ flex: '0 0 50%', px: 2 }}>
                <DeviceSelector devices={devices} handleChange={chooseAudioDevice} />
              </Box>
              {/*
              <FontAwesomeIcon icon={faMicrophone} />
              <canvas
                sx={{
                  width: 6,
                  height: 24,
                  m: 0,
                  verticalAlign: 'middle',
                  border: '1px solid rgba(0,0,0,.1)',
                  display: 'inline-block'
                }}
              ></canvas>
               */}
            </Fragment>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
