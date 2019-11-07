//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

const Notification = props => (
  <div
    sx={{
      ':not(:last-child)': { marginBottom: '1.5rem' },
      backgroundColor: props.isdanger ? '#ff3860' : 'whitesmoke',
      color: props.isdanger ? '#fff' : 'currentColor',
      borderRadius: 2,
      padding: 3,
      position: 'relative'
    }}
    {...props}
  />
);

export default Notification;
