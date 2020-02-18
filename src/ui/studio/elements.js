//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Flex } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';

// A div containing optional "back" and "next" buttons as well as the centered
// children. The props `prev` and `next` are objects with the follwing fields:
//
// - `onClick`: forwarded to the `<Button>`
// - `disabled`: forwarded to the `<Button>`
// - `label` (optional): the button label translation string. If not specified,
//   the label is 'back-button-label' or 'next-button-label'.
// - `danger` (optional): forwarded to the `<Button>`, default: `false`.
export function ActionButtons({ prev = null, next = null, children, sx }) {
  const { t } = useTranslation();

  return (
    <Flex sx={{ alignItems: 'center', mt: 2 }}>
      <Box sx={{ flex: '1 1 0', textAlign: 'left' }}>
        {prev && (
          <Button
            sx={{
              whiteSpace: 'nowrap',
              ...prev.danger === true ? { variant: 'buttons.danger' } : {}
            }}
            onClick={prev.onClick}
            disabled={prev.disabled}
            danger={prev.danger || false}
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
          >
            {t(next.label || 'next-button-label')}
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        )}
      </Box>
    </Flex>
  );
}
