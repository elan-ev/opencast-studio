import { createGlobalStyle } from 'styled-components/macro';

const GlobalStyle = createGlobalStyle`
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

label, button {
    cursor: pointer;
}

button {
    outline: none;
}

input {
    border: 1px solid #ccc;
    height: 2rem;
    border-radius: 0.125rem;
    padding: 0 0.5rem;
    outline: none;
    transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
    border-color: #09f;
    box-shadow: 0 0 3px #8cf;
}
`;

export default GlobalStyle;
