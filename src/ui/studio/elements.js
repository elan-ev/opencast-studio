//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import useResizeObserver from "use-resize-observer/polyfilled";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Flex } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import equal from 'fast-deep-equal';

// A div containing optional "back" and "next" buttons as well as the centered
// children. The props `prev` and `next` are objects with the follwing fields:
//
// - `onClick`: forwarded to the `<Button>`
// - `disabled`: forwarded to the `<Button>`
// - `label` (optional): the button label translation string. If not specified,
//   the label is 'back-button-label' or 'next-button-label'.
// - `danger` (optional): forwarded to the `<Button>`, default: `false`.
export function ActionButtons({ prev = null, next = null, children }) {
  const { t } = useTranslation();

  return (
    <Flex sx={{ alignItems: 'end', minHeight: '40px' }}>
      <Box sx={{ flex: '1 1 0', textAlign: 'left' }}>
        {prev && (
          <Button
            sx={{
              whiteSpace: 'nowrap',
              ...prev.danger === true ? { variant: 'buttons.danger' } : { variant: 'buttons.text' }
            }}
            onClick={prev.onClick}
            disabled={prev.disabled}
            danger={prev.danger || false}
            title={t(prev.label || 'back-button-label')}
          >
            <FontAwesomeIcon icon={faCaretLeft} />
            {t(prev.label || 'back-button-label')}
          </Button>
        )}
      </Box>
      <Box>{children}</Box>
      <Box sx={{ flex: '1 1 0', textAlign: 'right' }}>
        {next && (
          <Button
            sx={{
              whiteSpace: 'nowrap',
              '& svg': { mr: 0, ml: 2 },
              ...next.danger === true ? { variant: 'buttons.danger' } : {}
            }}
            onClick={next.onClick}
            disabled={next.disabled}
            title={t(next.label || 'next-button-label')}
          >
            {t(next.label || 'next-button-label')}
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        )}
      </Box>
    </Flex>
  );
}

const VideoBoxResizeContext = React.createContext(null);

export const useVideoBoxResize = () => React.useContext(VideoBoxResizeContext);

// Manages one or two children with given aspect ratio.
//
// Each child is given an aspect ratio. The child will be rendered within a
// `<div>` that maintains this exact aspect ratio. In the one child case, that
// `<div>` also perfectly fits within the parent container. In the case of two
// children, those children are laid out in such a way that the utilized screen
// space is maximized.
//
// `children` has to be the length 1 or 2! The parameter `gap` specifies the
// width of the empty space between the two children in the case that two
// children are given.
//
// Each child in `children` needs to be an object with the following fields:
//
// - `body`: the rendered DOM.
// - `aspectRatio`: the desired aspect ratio for the child.
// - `extraHeight`: sometimes the rendered child has a fixed extra height (for
//   example to render a title above or information below the video stream).
//   This extra height is included in the calculation such that the child minus
//   this extra height has the perfect `aspectRatio` as given above.
export function VideoBox({ gap = 0, children }) {
  const { ref, width = 1, height = 1 } = useResizeObserver();

  // This is a dummy state to force a rerender.
  const [, setForceCounter] = useState(0);
  const forceRender = () => {
    setForceCounter(v => v + 1);
  };

  // Setup the handler for when a video stream is resized.
  let dimensions = children.map(c => c.dimensions());
  const resizeVideoBox = () => {
    const newDimensions = children.map(c => c.dimensions());
    if (!equal(newDimensions, dimensions)) {
      dimensions = newDimensions;
      forceRender();
    }
  }

  const ar = ([width, height]) => width && height ? width / height : 16 / 9;

  switch (children.length) {
    case 1: {
      const child = children[0];
      const extraChildHeight = child.extraHeight || 0;
      const aspectRatio = ar(child.dimensions());


      // Calculate size of child
      let childWidth;
      let childHeight;

      const availableHeight = height - extraChildHeight;
      if (width > availableHeight * aspectRatio) {
        // Child height perfectly matches container, extra space left and right
        childHeight = availableHeight + extraChildHeight;
        childWidth = availableHeight * aspectRatio;
      } else {
        // Child width perfectly matches container, extra space top and bottom
        childWidth = width;
        childHeight = (width / aspectRatio) + extraChildHeight;
      }

      return (
        <VideoBoxResizeContext.Provider value={resizeVideoBox}>
          <div ref={ref} sx={{ flex: '1 0 0', minHeight: 0, display: 'flex' }}>
            <div sx={{ height: childHeight, width: childWidth, minWidth: '180px', margin: 'auto' }}>
              { child.body }
            </div>
          </div>
        </VideoBoxResizeContext.Provider>
      );
    }
    case 2: {
      // We need to decide whether the two videos are side by side or if one
      // should be below the other. We calculate the utilized space for each
      // option and then take the option that utilizes more space.
      //
      // Below we need to figure out the aspect ratios of the combined videos
      // either in row or column layout. Consider this table:
      //
      // |             | a      | b      | row    | column |
      // | ----------- | ------ | ------ | ------ | ------ |
      // | aspect      | 16:9   | 4:3    | 28:9   | 16:21  |
      // | normalized  | 1.77:1 | 1.33:1 | 3.11:1 | 0.76:1 |
      //
      // It shows the two aspect ratios a and b combined in both ways. In the
      // "row" case, the combined aspect ratio is simple: just add both children
      // aspect ratios. The column case is more difficult. First we have to
      // normalize both with respect to the width. This results in 1:0.56 and
      // 1:0.75 respectively. We can now add those, resulting in 1:1.31.
      // Finally, we normalize with respect to height again: 0.76:1

      const aspectRatios = children.map(c => ar(c.dimensions()));

      // Videos side by side (row).
      const { rowWidths, rowHeights } = (() => {
        const extraHeight = Math.max(children[0].extraHeight || 0, children[1].extraHeight || 0);
        const availableHeight = height - extraHeight;
        const availableWidth = width - gap;
        const combinedAspectRatio = aspectRatios[0] + aspectRatios[1];
        if (availableWidth > availableHeight * combinedAspectRatio) {
          // Children height perfectly matches container, extra space left and
          // right.
          return {
            rowHeights: Array(2).fill(availableHeight + extraHeight),
            rowWidths: aspectRatios.map(ar => availableHeight * ar),
          };
        } else {
          // Children width perfectly matches container, extra space top and
          // bottom.
          const baseHeight = availableWidth / combinedAspectRatio;
          return {
            rowHeights: children.map(c => baseHeight + (c.extraHeight || 0)),
            rowWidths: aspectRatios.map(ar => baseHeight * ar),
          }
        }
      })();

      // One video below the other (col/column).
      const { colWidths, colHeights } = (() => {
        const extraHeight = gap + (children[0].extraHeight || 0) + (children[1].extraHeight || 0);
        const availableHeight = height - extraHeight;
        const combinedAspectRatio =
          1 / ((1 / aspectRatios[0]) + (1 / aspectRatios[1]));

        if (width > availableHeight * combinedAspectRatio) {
          // Children height perfectly matches container, extra space left and
          // right.
          const width = availableHeight * combinedAspectRatio;
          return {
            colHeights: children.map((c, i) => (width / aspectRatios[i]) + (c.extraHeight || 0)),
            colWidths: Array(2).fill(width),
          };
        } else {
          // Children width perfectly matches container, extra space top and
          // bottom.
          return {
            colHeights: children.map((c, i) => (width / aspectRatios[i]) + (c.extraHeight || 0)),
            colWidths: Array(2).fill(width),
          }
        }
      })();

      // Finally, we compare the areas the two layouts would use. The one with
      // the larger area utilized wins.
      const rowArea = rowWidths[0] * rowHeights[0] + rowWidths[1] * rowHeights[1];
      const colArea = colWidths[0] * colHeights[0] + colWidths[1] * colHeights[1];
      let widths;
      let heights;
      let flexDirection;
      if (rowArea > colArea) {
        flexDirection = 'row';
        widths = rowWidths;
        heights = rowHeights;
      } else {
        flexDirection = 'column';
        widths = colWidths;
        heights = colHeights;
      }

      return (
        <VideoBoxResizeContext.Provider value={resizeVideoBox}>
          <div
            ref={ref}
            sx={{
              flex: '1 0 0',
              display: 'flex',
              flexDirection,
              justifyContent: 'space-between',
              minHeight: 0,
            }}
          >
            <div sx={{ height: heights[0], width: widths[0], minWidth: '180px', margin: 'auto' }}>
              { children[0].body }
            </div>
            <div sx={{ height: heights[1], width: widths[1], minWidth: '180px', margin: 'auto' }}>
              { children[1].body }
            </div>
          </div>
        </VideoBoxResizeContext.Provider>
      );
    }
    default:
      return <p>Internal error: too few or too many video streams</p>;
  }
}
