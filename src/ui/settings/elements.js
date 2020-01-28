//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import { Box } from '@theme-ui/components';

// A styled `<input>`` element.
export const Input = ({ errors, label, name, register, required, type = 'text', ...rest }) => {
  const { t } = useTranslation();

  return (
    <div
      sx={{
        '&:not(:last-child)': {
          mb: 3
        }
      }}
    >
      <label
        sx={{
          color: 'text',
          display: 'block',
          fontSize: 2,
          fontWeight: 'bold'
        }}
      >
        {label}
        <div
          sx={{
            display: 'block',
            boxSizing: 'border-box',
            clear: 'both',
            fontSize: 2,
            position: 'relative',
            textAlign: 'left'
          }}
        >
          <input
            aria-invalid={errors[name] ? 'true' : 'false'}
            aria-describedby={`${name}Error`}
            autoComplete="off"
            name={name}
            ref={register({ required })}
            sx={{ variant: 'styles.input' }}
            type={type}
            {...rest}
          />
          {errors[name] && (
            <p
              id={`${name}Error`}
              sx={{
                color: 'error',
                fontSize: 1,
                fontWeight: 'body',
                mt: 1
              }}
            >
              {t('forms-validation-error-required')}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};

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
