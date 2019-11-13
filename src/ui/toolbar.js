//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import Link from '../link';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faExclamationCircle,
  faPlayCircle,
  faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

const Icon = props => (
  <FontAwesomeIcon sx={{ color: 'text', fontSize: 5, verticalAlign: 'middle' }} {...props} />
);

function Toolbar({ uploadSettings, handleOpenUploadSettings }) {
  const { t } = useTranslation();

  return (
    <div
      sx={{
        height: '3rem',
        lineHeight: '3rem',
        textAlign: 'right',
        paddingRight: 2,
        boxShadow: '0 0px 4px 0px rgba(0, 0, 0, 0.4)',
        marginBottom: 2,
        '& > *': {
          marginLeft: 2
        }
      }}
    >
      <a href={uploadSettings.serverUrl} title={t('toolbar-button-opencast')}>
        <Icon icon={faPlayCircle} />
      </a>

      <label
        title={t('toolbar-button-upload-settings')}
        id="ocUploadSettingsOpenButton"
        onClick={handleOpenUploadSettings}
      >
        <Icon icon={faCog} />
      </label>

      <a
        href="https://github.com/elan-ev/opencast-studio/issues"
        title={t('toolbar-button-issues')}
        sx={{ paddingLeft: 3 }}
      >
        <Icon icon={faExclamationCircle} />
      </a>

      <Link to="/about" title={t('toolbar-button-about')}>
        <Icon icon={faQuestionCircle} />
      </Link>
    </div>
  );
}

export default Toolbar;
