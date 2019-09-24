//; -*- mode: rjsx;-*-
import React from "react";
import styled from "styled-components/macro";

function Footer(props) {
  return (
    <footer className={props.className}>
      <a href="/impressum.html">Impressum</a>
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
