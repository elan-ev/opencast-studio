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

export const Button = styled(Box)(
  {
    alignItems: 'center',
    appearance: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    position: 'relative',
    textAlign: 'center',
    textDecoration: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',

    fontSize: '1rem',
    height: '2.25em',
    lineHeight: 1.5,

    borderColor: '#dbdbdb',

    ':hover': {
      borderColor: '#b5b5b5'
    },

    ':active': {
      borderColor: '#4a4a4a'
    },
    ':focus': {
      borderColor: '#3273dc',
      outline: 'none'
    }
  },
  variant({
    scale: 'buttonStyles',
    variants: {
      primary: {
        backgroundColor: '#3273dc',
        borderColor: 'transparent',
        color: 'white',

        ':hover': {
          backgroundColor: '#276cda',
          borderColor: 'transparent',
          color: 'white'
        },

        ':focus': {
          borderColor: 'transparent',
          color: 'white'
        },

        ':focus:not(:active)': {
          boxShadow: '0 0 0 0.125em rgba(50, 115, 220, 0.25)'
        },

        ':active': {
          backgroundColor: '#2366d1',
          borderColor: 'transparent',
          color: 'white'
        }
      }
    }
  })
);

Button.defaultProps = {
  as: 'button',

  color: 'text',
  backgroundColor: 'white',

  borderRadius: 4,
  borderWidth: 1,
  borderStyle: 'solid',

  px: 3,
  py: 2
};
