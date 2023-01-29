//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { HTMLInputTypeAttribute } from 'react';
import { FieldError, FieldValues, Path, useForm, Validate } from 'react-hook-form';


type InputProps<I extends FieldValues, F> =
  Pick<JSX.IntrinsicElements['input'], 'onChange' | 'autoComplete' | 'defaultValue'> &
  Pick<ReturnType<typeof useForm<I>>, 'register'> & {
  /** Human readable string describing the field. */
  label: string,
  name: Path<I>,
  /** Whether this field is required or may be empty. */
  required: boolean,
  /** Function validating the value and returning a string in the case of error. */
  validate?: Validate<F, I>,
  errors: Partial<Record<keyof I, FieldError>>,
  /** Passed to the `<input>`. */
  type?: HTMLInputTypeAttribute,
};

// A styled `<input>` element with a label. Displays errors and integrated with
// `react-hook-form`.
export const Input = <I extends FieldValues, F>({
  errors,
  register,
  label,
  name,
  required,
  validate,
  type = 'text',
  ...rest
}: InputProps<I, F>) => {
  const { t } = useTranslation();
  const error = errors[name];

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
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${name}Error`}
            autoComplete="off"
            sx={{ variant: 'styles.input' }}
            type={type}
            {...rest}
            {...register(name, {
              validate,
              onChange: rest.onChange,
              ...required && { required: t('forms-validation-error-required') },
            })}
          />
          {error && (
            <p
              id={`${name}Error`}
              sx={{
                color: 'error',
                fontSize: 1,
                fontWeight: 'body',
                mt: 1
              }}
            >
              {error.message}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};
