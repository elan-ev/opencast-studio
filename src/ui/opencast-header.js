import React from "react";
import styled from "styled-components/macro";
import logo from "./opencast-studio.svg";
import LanguageChooser from "./language-chooser";

const Header = styled.header`
  height: 3rem;
  line-height: 3rem;
  display: block;
  width: 100%;
  background: #333;
  box-shadow: 0 4px 4px -4px rgba(0, 0, 0, 0.4);

  span {
    color: white;
  }
`;

const Logo = styled.img`
  height: 50px;
  padding-top: -5px;
`;

const BetaBubble = styled.span`
  position: relative;
  top: 4px;
  font-size: 6pt;
  vertical-align: top;
  display: inline;
  border: 1px solid #888;
  border-radius: 5px;
  padding: 2px;
  color: #888;
`;

function OpencastHeader(props) {
  return (
    <Header>
      <Logo src={logo} alt="Opencast Studio" />
      <BetaBubble>beta</BetaBubble>
      <LanguageChooser
        languages={props.languages}
        chosenLanguage={props.chosenLanguage}
        onSelectLanguage={props.onSelectLanguage}
      />
    </Header>
  );
}

export default OpencastHeader;
