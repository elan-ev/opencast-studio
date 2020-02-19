import css from '@emotion/css/macro'

const GlobalStyle = css`
* {
    box-sizing: border-box;
}

html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    min-height: 100%;
}

html, body, button, input {
    font-family: Ubuntu, Roboto, "Open Sans", "Segoe UI", "Helvetica Neue", Verdana, sans-serif;
}

body {
    overflow-x: hidden;
}

label, button:not(:disabled) {
    cursor: pointer;
}

button {
    outline: none;
}

#root {
  height: 100%;
}

@keyframes pulse {
  from { opacity: 0.85 }
  50% { opacity: 0.6 }
  to { opacity: 0.85 }
}
`;

export default GlobalStyle;
