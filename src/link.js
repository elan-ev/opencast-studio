//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Link as ReachLink } from '@reach/router';

const BASE = process.env.PUBLIC_URL;

const Link = ({ to = '', children, absolute, ...props }) => {
  if (!absolute && to[0] === '/') {
    to = BASE + to;
  }
  return (
    <ReachLink {...props} to={to}>
      {children}
    </ReachLink>
  );
};

export default Link
