//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from "theme-ui";

import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import "../style/global-style";


const Tooltip = ({ content, ...props }) => (
  <Tippy
    content={<span>{content}</span>}
    interactive={true}

    sx={{
      fontSize: "16px",
      backgroundColor: theme => theme.colors?.tooltip,
      color: theme => theme.colors?.tooltip_text,
      lineHeight: "normal",
      fontFamily: "Open Sans",
    }}

    {...props}
  >
    <span>{props.children}</span>
  </Tippy>
);

export default Tooltip;
