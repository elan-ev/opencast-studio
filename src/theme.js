const heading = {
  color: 'text',
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading'
};

const base = {
  breakpoints: ["700px"],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    heading: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 300,
    bold: 700
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },
  heights: {
    headerHeight: '3em',
  },
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#47af7a',
    secondary: '#30c',
    muted: '#f6f6f6',
    error: '#f14668',
    gray: ['#363636', '#666666', '#aaaaaa', '#dddddd']
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'primary',
      '&:hover': {
        bg: 'text'
      }
    },
    text: {
      color: 'text',
      bg: 'background'
    }
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body'
    },
    h1: {
      ...heading,
      fontSize: 5
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
        boxShadow: theme => `0 0 3px 0 ${theme.colors.primary}`
      },
      '&[aria-invalid="true"]': {
        borderColor: 'error',
        boxShadow: theme => `0 0 3px 0 ${theme.colors.error}`
      }
    },
    select: {
      height: '2rem',
      fontSize: '14pt',
      outline: 'none',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      width: '100%',
      '&:focus': {
        borderColor: 'primary',
        boxShadow: theme => `0 0 3px 0 ${theme.colors.primary}`
      }
    }
  }
};

export default base;
