//; -*- mode: rjsx;-*-
import styled from 'styled-components/macro';

const Button = styled.button`
  border-radius: 0.25rem;
  border: none;
  position: relative;
  margin: 0 0.5rem;
  background: linear-gradient(to bottom, #ddd 0%, #f0f0f0 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 2.5rem;
  line-height: 2.5rem;
  padding: 0.25rem;
  svg {
    margin: 0;
    padding: 0;
    outline: none;
  }
`;

export default Button;
