//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@theme-ui/components';

import { onSafari } from '../../../util.js';

const RecordingPreview = ({ deviceType, type, url, mimeType }) => {
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
      <video
        muted
        src={url}
        sx={{
          height: '150px',
          maxWidth: '100%',
          border: theme => `2px solid ${theme.colors.gray[1]}`,
        }}
      ></video>
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
