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

/* Remove outline for non-keyboard :focus */
*:focus:not(:focus-visible) {
  outline: none !important;
  box-shadow: 0 0 0 rgb(255, 255, 255) !important;
}

*:focus-visible {
  outline: 5px solid #2e724f !important;
  outline-offset: -5px;
}

button:focus-visible {
  outline: 5px solid #2e724f !important;
  outline-offset: -3px;
  background-color: #f5f5f5 !important;
  color: black;
}
`;

export default GlobalStyle;
