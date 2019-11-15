//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import toast from 'cogo-toast';
import { faDesktop, faVideo } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import MediaDevice from './media-device';
import Notification from './notification';

function startDisplayCapture(displayMediaOptions) {
  return navigator.mediaDevices.getDisplayMedia(displayMediaOptions).catch(err => {
    console.error('Error:' + err);
    toast.error('Your browser does not permit to capture the screen.');
    return null;
  });
}

function supportsDisplayCapture() {
  // Detecting whether display capture is supported is hard. There is currently
  // no proper solution. See these two links for more information:
  // - https://stackoverflow.com/q/58842831/2408867
  // - https://github.com/w3c/mediacapture-screen-share/issues/127
  //
  // To work around this problem, we simply check if the browser runs on a
  // mobile device. Currently, no mobile device/browser supports display
  // capture. However, this will probably change in the future, so we have to
  // revisit this issue again. This is tracked in this issue:
  // https://github.com/elan-ev/opencast-studio/issues/204
  return 'mediaDevices' in navigator
    && 'getDisplayMedia' in navigator.mediaDevices
    && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function startUserCapture(userMediaOptions) {
  const userMediaPromise = navigator.mediaDevices.getUserMedia(userMediaOptions);

  return userMediaPromise.catch(err => {
    console.error('Error:' + err);
    toast.error('Your browser does not permit to capture your webcam.');
    return null;
  });
}

function supportsUserCapture() {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

function MediaDevices(props) {
  const { t } = useTranslation();

  function requestDisplayMedia() {
    startDisplayCapture({ video: true, audio: true }).then(desktopStream => {
      props.setDesktopStream(desktopStream);
    });
  }

  function requestUserMedia() {
    startUserCapture({
      audio: true,
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 }
      }
    }).then(videoStream => {
      props.setVideoStream(videoStream);
    });
  }

  return (
    <div
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: ['column', 'row'],
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
          flex: '1 0 50%'
        }
      }}
    >
      {supportsDisplayCapture() && (
        <MediaDevice
          onClick={requestDisplayMedia}
          title={t('share-desktop')}
          deviceType="desktop"
          icon={faDesktop}
          stream={props.desktopStream}
        />
      )}

      {supportsUserCapture() && (
        <MediaDevice
          onClick={requestUserMedia}
          title={t('share-webcam')}
          deviceType="video"
          icon={faVideo}
          stream={props.videoStream}
        />
      )}

      {!supportsDisplayCapture() && !supportsUserCapture() && (
        <div sx={{ p: 3 }}>
          <Notification isDanger>
            Your browser does not allow capturing your display or any other media input.
          </Notification>
        </div>
      )}
    </div>
  );
}

export default MediaDevices;
