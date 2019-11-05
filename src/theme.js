// export default {
//   space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
//   fonts: {
//     body: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
//     heading: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
//     monospace: '"Roboto Mono", monospace'
//   },
//   fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
//   fontWeights: {
//     body: 400,
//     heading: 600,
//     bold: 800
//   },
//   lineHeights: {
//     body: 1.5,
//     heading: 1.125
//   },
//   colors: {
//     text: '#202124',
//     background: '#fff',
//     primary: '#1a73e8',
//     secondary: '#9c27b0',
//     muted: '#f1f3f4'
//   },
//   text: {
//     body: {
//       fontFamily: 'body',
//       fontWeight: 'body',
//       lineHeight: 'body'
//     },
//     heading: {
//       fontSize: 4,
//       fontFamily: 'heading',
//       fontWeight: 'heading',
//       lineHeight: 'heading'
//     },
//     display: {
//       variant: 'textStyles.heading',
//       fontSize: 6,
//       pt: 1,
//       pb: 2
//     },
//     link: {
//       variant: 'textStyles.body',
//       color: 'primary',
//       cursor: 'pointer',
//       textDecoration: 'underline'
//     }
//   }
// };

const heading = {
  color: 'text',
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading'
};

const base = {
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
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#07c',
    secondary: '#30c',
    muted: '#f6f6f6'
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
    }
  }
};

export default base;
