// src/GlobalStyles.js

import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Reset CSS */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    background-color: ${(props) => props.theme.bodyBg};
    color: ${(props) => props.theme.textColor};
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

export default GlobalStyles;
