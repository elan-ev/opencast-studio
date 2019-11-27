//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex, Grid, Heading } from '@theme-ui/components';
import React, { useCallback, useEffect, useState } from 'react';
import { Transition } from 'react-transition-group';

import Notification from '../notification';

export function Fade({ children, duration = 300, ...rest }) {
  const transitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0.5 },
    exited: { opacity: 0.5 }
  };
  return (
    <Transition timeout={duration} {...rest}>
      {state => (
        <Box
          sx={{
            transition: `opacity ${duration}ms ease-in-out`,
            ...transitionStyles[state]
          }}
        >
          {children}
        </Box>
      )}
    </Transition>
  );
};

export function FadeInLeft({ children, duration = 200, ...rest }) {
  const transitionStyles = {
    entering: { opacity: 1, transform: 'translate3d(-150%, 0, 0)' },
    entered: { opacity: 1, transform: 'translate3d(0, 0, 0)' },

    exiting: { opacity: 0.01, transform: 'translate3d(-150%, 0, 0)' },
    exited: { opacity: 0.01, transform: 'translate3d(0, 0, 0)' }
  };
  return (
    <Transition timeout={duration} {...rest}>
      {state => (
        <Box
          sx={{
            transition: `all ${duration}ms ease-in-out`,
            ...transitionStyles[state]
          }}
        >
          {children}
        </Box>
      )}
    </Transition>
  );
};

export function FadingNotification({ duration = 1000, text, ...rest }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <Fade in={visible} duration={duration} unmountOnExit>
      <Notification sx={{ my: 2 }}>{text}</Notification>
    </Fade>
  );
}

export function Header({ button = null, text }) {
  return (
    <Flex as="header" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Styled.h1>{text}</Styled.h1>
      {button}
    </Flex>
  );
}

export function PromptAndProceed({ children, prev, next }) {
  return (
    <Box>
      <Flex
        sx={{
            height: 50,
            mb: 3,
            alignItems: 'center',
            justifyContent: 'space-between'
        }}
      >
        <Box sx={{minWidth: '100px'}}>{prev}</Box>
        <Heading as="h3">{children}</Heading>
        <Box sx={{minWidth: '100px'}}>{next}</Box>
      </Flex>
    </Box>
  );
}

export function ShareButton({ children, disabled = false, handleClick, icon }) {
  return (
    <Button disabled={disabled && 'disabled'} onClick={handleClick}>
      <FontAwesomeIcon icon={icon} />
      {children}
    </Button>
  );
}

export function SplitPane({ left, right, gap = 40, ...rest }) {
  const columns = Number(!!left) + Number(!!right);
  return (
    <Grid gap={3} columns={[1, columns]} {...rest}>
      {left && <Box>{left}</Box>}
      {right && <Box>{right}</Box>}
    </Grid>
  );
}

export function Tabs(props) {
  const valueToIndex = new Map();

  let childIndex = 0;
  const children = React.Children.map(props.children, child => {
    if (!React.isValidElement(child)) {
      return null;
    }

    const childValue = child.props.value === undefined ? childIndex : child.props.value;
    valueToIndex.set(childValue, childIndex);
    const active = childValue === props.value;
    childIndex += 1;
    return React.cloneElement(child, { active, onChange: props.onChange, value: childValue });
  });

  return (
    <Flex
      sx={{
        userSelect: 'none',

        fontSize: 2,

        alignItems: 'stretch',
        justifyContent: 'space-between',
        overflow: 'hidden',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}
    >
      <ul
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          flexShrink: 0,
          justifyContent: 'center',

          borderBottomColor: 'gray.3',
          borderBottomStyle: 'solid',
          borderBottomWidth: 1
        }}
      >
        {children}
      </ul>
    </Flex>
  );
}

export function Tab({ active = false, label, icon, onChange, value }) {
  const handleChange = useCallback(
    event => {
      onChange && onChange(event, value);
    },
    [onChange, value]
  );
  return (
    <li
      sx={{
        display: 'block',
        button: {
          textRendering: 'optimizeLegibility',

          bg: active ? 'background' : 'inherit',
          borderColor: active ? 'primary' : 'transparent',
          borderBottomColor: active ? 'transparent' : 'gray.3',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: '4px 4px 0 0',

          color: active ? 'primary' : 'text',

          position: 'relative',

          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',

          mb: '-1px',

          py: 2,
          px: 3,

          verticalAlign: 'top',
          cursor: 'pointer'
        },
        'button:hover': {
          bg: active ? 'background' : 'gray.4'
        },
        'svg:first-of-type': {
          mr: 2
        },
        'svg:last-of-type': {
          ml: 2
        }
      }}
    >
      <Button variant="text" onClick={handleChange}>
        <FontAwesomeIcon icon={icon} />
        <span sx={{ display: ['none', 'inline-block']}}>{label}</span>
      </Button>
    </li>
  );
}

export function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return value === index ? (
    <Box p={3} {...other}>
      {children}
    </Box>
  ) : null;
}
