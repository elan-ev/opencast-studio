import { darken } from '@theme-ui/color';
import { Theme } from 'theme-ui';

const heading = {
  color: 'text',
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading'
};

const baseButton = {
  fontSize: 2,
  '& svg': {
    mr: 2
  },
  '&:disabled': {
    bg: 'background',
    borderColor: 'gray.2',
    borderWidth: 1,
    borderStyle: 'solid',
    color: 'text',
    cursor: 'not-allowed',
    opacity: 0.5
  }
};

const colors = {
  text: '#000',
  background: '#fff',
  button_fg: '#fff',
  button_bg: '#363636',
  primary: '#47af7a',
  error: '#f14668',
  gray: ['#363636', '#666666', '#aaaaaa', '#dddddd', '#f5f5f5'],
  element_bg: '#fff',
  notification_text: '#fff',
  tooltip: '#363636',
  tooltip_text: '#fff',
  focus: ['#363636', '#dddddd', '#dddddd', '#aaaaaa'],
  singleKey_bg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
  singleKey_border: 'Gainsboro',
  modes: {
    dark: {
      text: 'rgba(255, 255, 255, 0.87)',
      background: '#1C1C1E',
      button_fg: '#fff',
      button_bg: '#666666',
      primary: '#388c61',
      error: 'rgba(241, 70, 104, 0.8)',
      gray: ['#f5f5f5', '#dddddd', '#aaaaaa', '#666666', '#363636'],
      element_bg: '#363636',
      notification_text: 'rgba(255, 255, 255, 0.9)',
      tooltip: '#dddddd',
      tooltip_text: '#000',
      focus: ['#dddddd', '#363636', '#dddddd', '#dddddd'],
      singleKey_bg: 'linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(30,30,30,1) 100%)',
      singleKey_border: '#404040',
    }
  }
} satisfies Theme['colors'];

const base = {
  breakpoints: ['576px', '768px', '992px', '1200px'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    heading: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 300,
    heading: 600,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },
  heights: {
    headerHeight: '3em'
  },
  config: {
    useColorSchemeMediaQuery: true,
    useLocalStorage: true,
    initialColorModeName: 'light',
  },
  colors: colors,
  colorz: colors,
  text: {
    text: {
      fontWeight: 'body',
      fontSize: '18px',
    },
    heading: {
      fontWeight: 'heading',
      fontSize: '18px',
    },
  },
  buttons: {
    primary: {
      ...baseButton,
      bg: 'primary',
      color: 'button_fg',
      '&:not(:disabled):hover,&:not(:disabled):focus': {
        bg: 'var(--theme-ui-colors-btn-hover)'
      },
      '&:disabled': {
        bg: 'gray.1'
      },
    },
    danger: {
      ...baseButton,
      bg: 'error',
      color: 'button_fg',
      '&:not(:disabled):hover, &:not(:disabled):focus': {
        bg: darken('error', 0.03)
      }
    },
    text: {
      ...baseButton,
      bg: 'background',
      color: 'text',
      border: theme => `1px solid ${theme.colorz.gray[1]}`,
      '&:not(:disabled):hover, &:not(:disabled):focus': {
        bg: 'gray.3'
      }
    }
  },
  cards: {
    primary: {
      bg: 'background',
      boxShadow: '0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1), 0 0px 0 1px rgba(10, 10, 10, 0.02)',
      color: 'text',
      maxWidth: '100%',
      position: 'relative'
    }
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      '--theme-ui-colors-btn-hover': darken('primary', 0.03),
      '--theme-ui-colors-controls': '#000',
      '--theme-ui-colors-info': '#f5f5f5',
      '*:focus:not(:focus-visible)': {
        /* Remove outline for non-keyboard :focus */
        outline: 'none !important',
        boxShadow: '0 0 0 rgb(255, 255, 255) !important',
      },
      '*:focus-visible': {
        outline: theme => `5px solid ${theme.colorz.focus[0]}`,
        outlineOffset: '-5px',
      },
      '.tippy-box > .tippy-arrow::before': {
        color: theme => `${theme.colorz.tooltip}`
      },
    },
    h1: {
      ...heading,
      mt: 0,
      mb: 3,
      fontSize: 5,
    },
    h2: {
      ...heading,
      fontSize: 4
    },
    h3: {
      ...heading,
      fontSize: 3
    },
    h4: {
      ...heading,
      fontSize: 2
    },
    h5: {
      ...heading,
      fontSize: 1
    },
    h6: {
      ...heading,
      fontSize: 0
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body'
    },
    a: {
      color: 'primary'
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit'
      }
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid'
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid'
    },
    img: {
      maxWidth: '100%'
    },
    input: {
      backgroundColor: 'element_bg',
      color: 'text',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'gray.2',
      height: '2rem',
      fontSize: '14pt',
      borderRadius: 2,
      px: 2,
      py: 0,
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      width: '100%',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: theme => `0 0 3px 0 ${theme.colorz.focus[0]}`
      },
      '&[aria-invalid="true"]': {
        borderColor: 'error',
        boxShadow: theme => `0 0 3px 0 ${theme.colorz.error}`
      }
    },
    select: {
      backgroundColor: 'element_bg',
      border: 'solid 1px var(--theme-ui-colors-gray-2)',
      borderRadius: '2px',
      color: 'text',
      height: '2rem',
      fontSize: '14pt',
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      width: '100%',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: theme => `0 0 3px 0 ${theme.colorz.focus[0]}}`
      }
    },
    dropdown: {
      backgroundColor: 'element_bg',
      color: 'text',
      fontSize: '14pt',
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      width: '100%',
      boxShadow: 'none',
      borderRadius: '2px',
      fontWeight: 'normal',
    },
    progress: {
      bg: '#ebebeb',
      color: '#4ab57f',
      height: '8px',
    }
  },
  container: {
    mx: 'auto',
    p: 3,
    maxWidth: ['none', 'none', 960, 1152, 1344]
  }
} satisfies Omit<Theme, 'colorz'> & { colorz: any };

// Extend the `Theme` interface to accomodate our own properties.
declare module 'theme-ui' {
  interface Theme {
    heights: {
      headerHeight: string,
    },
    container: {
      mx: 'auto',
      p: number,
      maxWidth: ['none', 'none', 960, 1152, 1344],
    },

    // Huff, this is extra... sketchy. In this project we often use
    // `theme.colorz.something` where `theme` is just `Theme` from `theme-ui`.
    // But there, `colors` is an optional property. And typescript obviously
    // does not know about which colors we defined. The intuitive idea would be
    // to change the definition of `Theme` to have the specific type of our
    // theme. That's unfortunately not possible though. One can only add fields
    // to interfaces. So to get type safety, we use this stupid `colorz`.
    colorz: typeof colors,
  }
}

export default base;
