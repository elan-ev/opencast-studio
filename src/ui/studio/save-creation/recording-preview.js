//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@theme-ui/components';

import { onSafari } from '../../../util.js';

const RecordingPreview = ({ deviceType, url, mimeType, onDownload, downloaded }) => {
  const flavor = deviceType === 'desktop' ? 'presentation' : 'presenter';

  // Determine the correct filename extension.
  // TODO: we might want to parse the mime string in the future? But right now,
  // browsers either record in webm or mp4.
  let fileExt;
  if (mimeType && mimeType.startsWith("video/webm")) {
    fileExt = "webm";
  } else if (mimeType && mimeType.startsWith("video/mp4")) {
    fileExt = "mp4";
  } else if (onSafari()) {
    // Safari does not understand webm
    fileExt = "mp4";
  } else {
    // If we know nothing, our best guess is webm.
    fileExt = "webm";
  }
  const downloadName = `oc-studio-${now_as_string()}-${flavor}.${fileExt}`;

  if (!url) {
    return null;
  }

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        mx: 2,
        pb: '12px',
      }}
    >
      <div sx={{
        position: 'relative',
        height: '150px',
        border: theme => `2px solid ${theme.colors.gray[1]}`,
      }}>
        <video
          muted
          src={url}
          // Without this, some browsers show a black video element instead of the first frame.
          onLoadedData={e => e.target.currentTime = 0}
          preload="auto"
          sx={{
            maxWidth: '100%',
            height: '100%',
          }}
        ></video>
        { downloaded && (
          <div sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'primary',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}>
            <FontAwesomeIcon icon={faCheckCircle} size="4x" />
          </div>
        )}
      </div>
      <Button
        as="a"
        sx={{
          width: '100%',
          maxWidth: '170px',
          margin: 'auto',
          mt: '10px',
        }}
        target="_blank"
        download={downloadName}
        href={url}
        rel="noopener noreferrer"
        onClick={onDownload}
      >
        <FontAwesomeIcon icon={faDownload} />
        Download
      </Button>
    </div>
  );
};

export default RecordingPreview;

const now_as_string = () => {
  const pad2 = n => n >= 10 ? '' + n : '0' + n;

  const now = new Date();
  return ''
    + now.getFullYear() + '-'
    + pad2(now.getMonth() + 1) + '-'
    + pad2(now.getDate()) + '_'
    + pad2(now.getHours()) + '-'
    + pad2(now.getMinutes());
};
