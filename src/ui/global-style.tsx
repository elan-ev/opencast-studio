import { Global, css } from "@emotion/react";

// There are also very few global styles in `index.html` as those are needed for
// the loading indicator already.
export const GlobalStyle: React.FC = () => <>
  <Global styles={CSS_RESETS} />
  <Global styles={GLOBAL_STYLE} />
</>;


/** This is just styling for Tobira that we want to apply globally. */
const GLOBAL_STYLE = css({
  ":root": {
    "--min-page-width": "320px",
  },
  body: {
    // // Accent color for generated UI control `<input>` elements
    // // where type="checkbox", "radio" or "range",
    // // as well as `<progress>` elements.
    // accentColor: COLORS.primary0,

    fontFamily: "'Roboto Flex Variable', sans-serif",
    fontWeight: 400,

    // A reset to a sensible value.
    lineHeight: 1.5,

    // 16px is a good default body text size according to the internet (TM).
    fontSize: 16,

    // From a set of popular phones, the iPhone 5 has the smallest viewport
    // width: 320px. It does make sense to set a minimum width early on in
    // order to know where we can stop caring.
    minWidth: "var(--min-page-width)",
  },
  // a: {
  //     color: COLORS.primary0,
  //     "&:hover, &:focus": {
  //         textDecoration: "none",
  //         color: COLORS.primary1,
  //     },
  //     ":focus-visible": { outline: `2.5px solid ${COLORS.focus}` },
  // },
});

/**
 * The following is a minimal set of CSS reset rules in order to get rid of
 * browser dependent, inconsistent or unexpected behavior. Parts of this
 * are taken from here: https://github.com/hankchizljaw/modern-css-reset
 * Licensed as MIT, Andy Bell and other contributors
 */
const CSS_RESETS = css({
  // Everything should have box-sizing border-box by default as it's more
  // intuitive and expected.
  "*, *::before, *::after": {
    boxSizing: "border-box",
  },

  // Remove default margins of the most important elements.
  "body, h1, h2, h3, h4, p, li, figure, figcaption, blockquote, dl, dd, pre": {
    margin: 0,
  },

  "html, body, body > #root": {
    height: "100%",
  },

  // This improves the readability of underlines in links.
  a: {
    textDecorationSkipInk: "auto",
  },

  // Some elements not inhereting fonts is a really confusing browser default.
  "input, button, textarea, select": {
    font: "inherit",
    margin: 0,
  },
});
