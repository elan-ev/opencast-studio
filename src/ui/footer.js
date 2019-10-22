//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

function Footer(props) {
  const { t } = useTranslation();

  return (
    <footer className={props.className}>
      <a href="/impressum.html">{t('legal-notices')}</a>
    </footer>
  );
}

const StyledFooter = styled(Footer)`
  padding: 1rem;
  text-align: center;
`;

export default StyledFooter;
