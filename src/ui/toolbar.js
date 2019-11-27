//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

function Toolbar({ settings }) {
  return (
    <div
      sx={{
        height: '3rem',
        lineHeight: '3rem',
        textAlign: 'right',
        paddingRight: 2,
        boxShadow: '0 0px 4px 0px rgba(0, 0, 0, 0.4)',
        marginBottom: 2,
        '& > *': {
          marginLeft: 2
        }
      }}
    ></div>
  );
}

export default Toolbar;
