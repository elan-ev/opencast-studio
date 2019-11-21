//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

const Notification = ({isDanger, ...rest}) => (
  <div
    sx={{
      ':not(:last-child)': { marginBottom: '1.5rem' },
      backgroundColor: isDanger ? 'error' : 'gray.3',
      color: isDanger ? 'background' : 'currentColor',
      borderRadius: 2,
      padding: 3,
      position: 'relative'
    }}
    {...rest}
  />
);

export default Notification;
