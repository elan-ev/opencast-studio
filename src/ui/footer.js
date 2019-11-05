//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Link } from '@reach/router';
import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';

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
