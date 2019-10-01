//; -*- mode: rjsx;-*-
import styled from 'styled-components/macro';

const Button = styled.button`
  background-color: transparent;
  border: none;
  position: relative;
  margin: 0 0.5rem;
  padding: 0.25rem;

  font-size: ${props => props.large ? 3.5 : 2.5}rem;
  line-height: ${props => props.large ? 3.5 : 2.5}rem;

  svg {
    margin: 0;
    padding: 0;
    outline: none;
  }
`;

export default Button;
