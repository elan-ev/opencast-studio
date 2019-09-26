//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';
import { useTranslation } from 'react-i18next';

function Footer(props) {
  const { t } = useTranslation();

  return (
    <footer className={props.className}>
      <a href="/impressum.html">{t('about-us')}</a>
    </footer>
  );
}

const StyledFooter = styled(Footer)`
  padding-top: 25px;
  text-align: center;

  a {
    padding: 0 10px;
  }
`;

export default StyledFooter;
