//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';
import Link from '../link';

function Footer(props) {
  const { t } = useTranslation();

  return (
    <Box
      as="footer"
      sx={{
        p: 1,
        textAlign: 'center'
      }}
    >
      <Link
        sx={{
          fontSize: 1
        }}
        to="/impressum"
      >
        {t('legal-notices')}
      </Link>
    </Box>
  );
}

export default Footer;
