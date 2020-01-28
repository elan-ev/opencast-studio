//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Box } from '@theme-ui/components';

const RecordingPreview = ({ deviceType, title, type, url }) => {
  const flavor = deviceType === 'desktop' ? 'Presentation' : 'Presenter';
  const downloadName = `${flavor} ${type} - ${title || 'Recording'}.webm`;

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
