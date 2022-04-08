import css from '@emotion/css/macro'

const GlobalStyle = css`
* {
  box-sizing: border-box;
}

html, body, button, input {
  font-family: Ubuntu, Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, sans-serif;
}

body {
  overflow-x: auto;
}

label, button:not(:disabled) {
  cursor: pointer;
}

button {
  outline: none;
}

#root {
  /* Of the most common mobile phones, the smallest viewport width is
     320 (iPhone 5). */
  min-width: 320px;
  overflow-x: hidden;
  height: 100%;
}

@keyframes pulse {
  from { opacity: 0.85 }
  50% { opacity: 0.6 }
  to { opacity: 0.85 }
}

a {
  border-left: 1px solid #dddddd;
}

*:focus {
  /* Provide a fallback style for browsers
    that don't support :focus-visible */
  outline: 2px solid red;
  background: transparent;
}

@supports selector(*:focus-visible) {
  *:focus, button:focus, select:focus, input:focus, a:focus, svg:focus  {
    /* Remove the focus indicator on mouse-focus for browsers
       that do support :focus-visible */
    outline: none !important;
    background: transparent;
  }
}

*:focus-visible, button:focus-visible, select:focus-visible, input:focus-visible, a:focus-visible, svg:focus-visible {
  border: 5px solid darkorange;
  border-radius: 0.25rem;
  box-sizing: border-box;
}

`;

export default GlobalStyle;
