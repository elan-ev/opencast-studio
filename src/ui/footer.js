//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';
import { navigate } from "@reach/router";
import { Box, Link } from './base-components';

function Footer(props) {
  const { t } = useTranslation();

  return (
      <Box as="footer" p="1rem" textAlign="center" className={props.className}>
        <Link fontSize={1} onClick={() => navigate('/impressum') }>{t('legal-notices')}</Link>
    </Box>
  );
}

const StyledFooter = styled(Footer)``;

export default StyledFooter;
