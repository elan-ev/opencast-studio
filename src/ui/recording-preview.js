//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

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
    color: 'transparent'
  };

  if (!url) {
    return (
      <a sx={style} target="_blank" href={url} download={downloadName} rel="noopener noreferrer">
        {deviceType}
      </a>
    );
  }

  return (
    <a sx={style} target="_blank" download={downloadName} href={url} rel="noopener noreferrer">
      {deviceType}
      <video
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
    </a>
  );
};

export default RecordingPreview;
