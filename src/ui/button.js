//; -*- mode: rjsx;-*-
import styled, { css } from 'styled-components/macro';

const primaryMixin = css`
  background-color: #3273dc;
  border-color: transparent;
  color: #fff;

  :hover {
    background-color: #276cda;
    border-color: transparent;
    color: #fff;
  }

  :focus {
    border-color: transparent;
    color: #fff;
  }

  :focus:not(:active) {
    box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
  }

  :active {
    background-color: #2366d1;
    border-color: transparent;
    color: #fff;
  }
`;

const Button = styled.button`
  user-select: none;

  appearance: none;
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #dbdbdb;
  color: #363636;
  cursor: pointer;
  display: inline-flex;
  font-size: 1rem;
  height: 2.25em;
  justify-content: center;
  justify-content: flex-start;
  line-height: 1.5;
  padding-bottom: calc(0.375em - 1px);
  padding-left: 0.75em;
  padding-right: 0.75em;
  padding-top: calc(0.375em - 1px);
  position: relative;
  text-align: center;
  vertical-align: top;
  white-space: nowrap;

  :hover {
    border-color: #b5b5b5;
  }

  :active {
    border-color: #4a4a4a;
  }

  :focus {
    border-color: #3273dc;
    outline: none;
  }

  ${props => (props.primary ? primaryMixin : null)}
`;

export default Button;
