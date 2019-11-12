//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

const Notification = props => (
  <div
    sx={{
      ':not(:last-child)': { marginBottom: '1.5rem' },
      backgroundColor: props.isDanger ? '#ff3860' : 'whitesmoke',
      color: props.isDanger ? '#fff' : 'currentColor',
      borderRadius: 2,
      padding: 3,
      position: 'relative'
    }}
    {...props}
  />
);

export default Notification;
