/** @jsx jsx */
import { jsx } from 'theme-ui';

const Flag = ({ alt, ...rest }) => (
  <img
    alt={alt || ''}
    sx={{
      width: '2rem',
      height: '2rem',
      margin: '0.5rem 0 0.5rem 0.5rem',
      verticalAlign: 'top',
      display: 'inline-block'
    }}
    {...rest}
  />
);

export default Flag;
