//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, ThemeProvider } from 'theme-ui';

import { Global } from '@emotion/core';
import { configure, addDecorator } from '@storybook/react';
import theme from '../src/theme.js'
import GlobalStyle from '../src/style/global-style';

// automatically import all files ending in *.stories.js
configure(require.context('../src', true, /\.stories\.js$/), module);

addDecorator((story) => (
  <ThemeProvider theme={theme}>
    <Global styles={GlobalStyle}/>
    {story()}
  </ThemeProvider>
))
