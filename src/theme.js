export default {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    heading: 'Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, system-ui, sans-serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 600,
    bold: 800
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125
  },
  colors: {
    text: '#202124',
    background: '#fff',
    primary: '#1a73e8',
    secondary: '#9c27b0',
    muted: '#f1f3f4'
  },
  textStyles: {
    body: {
      fontSize: 3,
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
      py: 1
    },
    heading: {
      fontSize: 4,
      fontFamily: 'heading',
      fontWeight: 'heading',
      lineHeight: 'heading'
    },
    display: {
      variant: 'textStyles.heading',
      fontSize: 6,
      pt: 1,
      pb: 2
    },
    link: {
      variant: 'textStyles.body',
      color: 'primary'
    }
  }
};
