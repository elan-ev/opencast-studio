//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';
import { Box } from '@theme-ui/components';


export const SettingsSection = ({ title, children }) => (
  <Box
    sx={{
      '&:not(:last-child)': {
        mb: 5
      }
    }}
  >
    <Styled.h2
      sx={{
        borderBottom: theme => `1px solid ${theme.colors.gray[2]}`,
        pb: 1,
        my: 3,
        mx: 0
      }}
    >
      {title}
    </Styled.h2>
    {children}
  </Box>
);
