import React from "react";

import { COLORS, focusStyle } from "../util";


type Props = JSX.IntrinsicElements["select"];

/** Styled `<select>` */
export const Select = React.forwardRef<HTMLSelectElement, Props>((props, ref) => (
  <select ref={ref} {...props} css={{
    position: "relative",
    borderRadius: 6,
    padding: "6px 12px",
    backgroundColor: "transparent",
    border: `1px solid ${COLORS.neutral25}`,
    option: {
      backgroundColor: COLORS.neutral05,
      color: COLORS.neutral90,
    },
    ...focusStyle({ offset: -1 }),
  }}>{props.children}</select>
));
