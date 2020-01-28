//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Flex, Grid } from '@theme-ui/components';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// A div containing optional "back" and "next" buttons as well as the centered
// children. The props `prev` and `next` are objects with the fields `onClick`
// and `disabled`, both of which are forwarded to the `<Button>`.
export function ActionButtons({ prev = null, next = null, children, sx }) {
  const { t } = useTranslation();

  return (
    <Flex sx={{ alignItems: 'center', mt: 2 }}>
      <Box sx={{ flex: '1 1 0', textAlign: 'left' }}>
        {prev && (
          <Button sx={{ whiteSpace: 'nowrap' }} onClick={prev.onClick} disabled={prev.disabled}>
            <FontAwesomeIcon icon={faCaretLeft} />
            {t('back-button-label')}
          </Button>
        )}
      </Box>
      <Box>{children}</Box>
      <Box sx={{ flex: '1 1 0', textAlign: 'right' }}>
        {next && (
          <Button
            sx={{ whiteSpace: 'nowrap', '& svg': { mr: 0, ml: 2 } }}
            onClick={next.onClick}
            disabled={next.disabled}
          >
            {t('next-button-label')}
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        )}
      </Box>
    </Flex>
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
    <Grid gap={3} columns={[1, columns]} {...rest} sx={{ minHeight: 0 }}>
      {left && <Box sx={{ minHeight: 0 }}>{left}</Box>}
      {right && <Box sx={{ minHeight: 0 }}>{right}</Box>}
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
        <span sx={{ display: ['none', 'inline-block'] }}>{label}</span>
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
