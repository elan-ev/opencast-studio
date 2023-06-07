//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

type Props = Omit<JSX.IntrinsicElements['div'], 'css'> & React.PropsWithChildren<{
  isDanger?: boolean;
}>;

const Notification: React.FC<Props> = ({ isDanger = false, children, ...rest }) => (
  <div
    sx={{
      ':not(:last-child)': { marginBottom: '1.5rem' },
      backgroundColor: isDanger ? 'error' : 'gray.3',
      color: isDanger ? 'notification_text' : 'currentColor',
      borderRadius: 2,
      padding: 3,
      position: 'relative'
    }}
    {...rest}
  >{children}</div>
);

export default Notification;
