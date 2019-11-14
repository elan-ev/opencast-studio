//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { Link as ReachLink, navigate as reachNavigate } from '@reach/router';

const BASE = process.env.PUBLIC_URL;

export const Link = ({ to = '', children, absolute, ...props }) => {
  if (!absolute && to[0] === '/') {
    to = BASE + to;
  }
  return (
    <ReachLink {...props} to={to}>
      {children}
    </ReachLink>
  );
};

export const navigate = function(to, options) {
  if (to[0] === '/') {
    to = BASE + to;
  }

  return reachNavigate(to, options);
};
