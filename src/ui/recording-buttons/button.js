//; -*- mode: rjsx;-*-
import styled from 'styled-components/macro';

const Button = styled.button`
  background-color: transparent;
  border: none;
  position: relative;
  margin: 0 ${props => props.large ? 1 : 0.5}rem;
  padding: ${props => props.large ? 0.5 : 0.25}rem;

  font-size: ${props => props.large ? 5 : 2.5}rem;
  line-height: ${props => props.large ? 5 : 2.5}rem;

  svg {
    margin: 0;
    padding: 0;
    outline: none;
  }
`;

export default Button;
