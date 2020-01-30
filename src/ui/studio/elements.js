//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Box, Button, Flex } from '@theme-ui/components';
import { useTranslation } from 'react-i18next';

// A div containing optional "back" and "next" buttons as well as the centered
// children. The props `prev` and `next` are objects with the fields `onClick`
// and `disabled`, both of which are forwarded to the `<Button>`.
export function ActionButtons({ prev = null, next = null, children, sx }) {
  const { t } = useTranslation();

  return (
    <Flex sx={{ alignItems: 'center', mt: 2 }}>
      <Box sx={{ flex: '1 1 0', textAlign: 'left' }}>
        {prev && (
          <Button sx={{ whiteSpace: 'nowrap' }} onClick={prev.onClick} disabled={prev.disabled}>
            <FontAwesomeIcon icon={faCaretLeft} />
            {t('back-button-label')}
          </Button>
        )}
      </Box>
      <Box>{children}</Box>
      <Box sx={{ flex: '1 1 0', textAlign: 'right' }}>
        {next && (
          <Button
            sx={{ whiteSpace: 'nowrap', '& svg': { mr: 0, ml: 2 } }}
            onClick={next.onClick}
            disabled={next.disabled}
          >
            {t('next-button-label')}
            <FontAwesomeIcon icon={faCaretRight} />
          </Button>
        )}
      </Box>
    </Flex>
  );
}
