//; -*- mode: rjsx;-*-
import React, { forwardRef } from 'react';
import styled from 'styled-components/macro';
import { border, color, compose, flexbox, layout, space, typography, variant } from 'styled-system';

export const Box = styled.div(
  {
    boxSizing: 'border-box',
    minWidth: 0
  },
  compose(
    border,
    color,
    flexbox,
    layout,
    space,
    typography
  )
);
Box.displayName = 'Box';

export const Flex = styled(Box)({ display: 'flex' });

export const Container = props => <Box maxWidth={960} mx="auto" px={3} {...props} />;

export const Text = styled(Box).attrs(props => {
  props.color = props.color || 'text';
})`
  ${variant({
    scale: 'textStyles',
    variants: {
      body: {},
      heading: {},
      display: {},
      link: {}
    }
  })}
`;
Text.defaultProps = { fontSize: 3, variant: 'body' };

export const Heading = props => <Text as="h2" variant="heading" {...props} />;

export const Link = forwardRef((props, ref) => <Text ref={ref} as="a" variant="link" {...props} />);
