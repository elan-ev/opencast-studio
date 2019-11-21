//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

function FormField(props) {
  return (
    <div
      sx={{
        '&:not(:last-child)': {
          marginBottom: 3
        }
      }}
    >
      <label
        sx={{
          color: 'gray.0',
          display: 'block',
          fontSize: 2,
          fontWeight: 'bold'
        }}
      >
        {props.label}
        <div
          sx={{
            boxSizing: 'border-box',
            clear: 'both',
            fontSize: 2,
            position: 'relative',
            textAlign: 'left'
          }}
        >
          {props.children}
        </div>
      </label>
    </div>
  );
}

export default FormField;
