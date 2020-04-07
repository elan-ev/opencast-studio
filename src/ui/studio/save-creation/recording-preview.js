//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';

import { recordingFileName } from '../../../util.js';

const RecordingPreview = ({ deviceType, url, mimeType, onDownload, downloaded, blob }) => {
  const { t } = useTranslation();
  const flavor = deviceType === 'desktop' ? 'presentation' : 'presenter';
  const downloadName = recordingFileName(mimeType, flavor);

  if (!url) {
    return null;
  }

  // Get file size in human readable format. We use base-1000 XB instead of
  // base-1024 XiB, as the latter would probably confuse some users and many
  // file managers use base-1000 anyway. Notably, the windows file manager
  // calculates with base-1024 but shows "XB". So it is lying.
  const numBytes = blob.size;
  const round = n => n < 10 ? n.toFixed(1) : Math.round(n);
  const prettyFileSize = (() => {
    if (numBytes < 1000) {
      return `${numBytes} B`;
    } else if (numBytes < 999_500) {
      return `${round(numBytes / 1000)} KB`;
    } else if (numBytes < 999_500_000) {
      return `${round(numBytes / (1_000_000))} MB`;
    } else {
      return `${round(numBytes / (1_000_000_000))} GB`
    }
  })();


  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'column',
      flex: '0 0 auto',
      mx: 2,
      pb: '12px',
      alignItems: 'center',
    }}>
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
          maxWidth: '205px',
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
        {t('save-creation-download-button')}
        {' '}({ prettyFileSize })
      </Button>
    </div>
  );
};

export default RecordingPreview;
