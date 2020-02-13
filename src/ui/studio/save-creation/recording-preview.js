//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Box } from '@theme-ui/components';

import { onSafari } from '../../../util.js';

const RecordingPreview = ({ deviceType, title, type, url, mimeType }) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';

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
  const downloadName = `${flavor} ${type} - ${title || 'Recording'}.${fileExt}`;

  const style = {
    width: '8rem',
    height: '4.5rem',
    position: 'relative',
    backgroundColor: 'gray.3',
    textAlign: 'center',
    padding: '0.5rem',
    margin: '0 0.5rem 0.5rem 0',
    color: 'transparent',
    bg: 'background'
  };

  if (!url) {
    return (
      <a sx={style} target="_blank" href={url} download={downloadName} rel="noopener noreferrer">
        {deviceType}
      </a>
    );
  }

  return (
    <a
      sx={{
        ...style,
        ':hover': {
          video: { opacity: 0.2 },
          svg: { color: 'text' }
        }
      }}
      target="_blank"
      download={downloadName}
      href={url}
      rel="noopener noreferrer"
    >
      <video
        autoPlay
        muted
        sx={{
          position: 'absolute',
          maxWidth: '100%',
          maxHeight: '100%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        src={url}
      ></video>
      <Box
        sx={{
          position: 'absolute',
          top: 1,
          right: 1,
          fontSize: 4,
          color: 'white'
        }}
      >
        <FontAwesomeIcon icon={faFileDownload} />
      </Box>
    </a>
  );
};

export default RecordingPreview;
