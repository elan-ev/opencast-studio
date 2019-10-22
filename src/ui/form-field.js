//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

function FormField(props) {
  return (
    <div className={props.className}>
      <label className="label">
        {props.label}
        <div className="control">{props.children}</div>
      </label>
    </div>
  );
}

const StyledFormField = styled(FormField)`
  :not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
  }

  .label {
    color: #363636;
    display: block;
    font-size: 1rem;
    font-weight: 700;
  }

  .label:not(:last-child) {
    margin-bottom: 0.5em;
  }
`;

export default StyledFormField;
