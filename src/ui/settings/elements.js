//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Themed } from 'theme-ui';
import { Box } from '@theme-ui/components';


export const SettingsSection = ({ title, children }) => (
  <Box
    sx={{
      '&:not(:last-child)': {
        mb: 4
      }
    }}
  >
    <Themed.h2
      sx={{
        borderBottom: theme => `1px solid ${theme.colors.gray[2]}`,
        pb: 1,
        my: 3,
        mx: 0
      }}
    >
      {title}
    </Themed.h2>
    {children}
  </Box>
);
