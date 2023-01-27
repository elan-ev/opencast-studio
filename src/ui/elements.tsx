//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { HTMLInputTypeAttribute } from 'react';
import useForm from 'react-hook-form/dist/useForm';
import { Validate } from 'react-hook-form/dist/types';


type InputProps = Pick<JSX.IntrinsicElements["input"], "onChange"> & {
  /** Human readable string describing the field. */
  label: string,
  name: string,
  /** Whether this field is required or may be empty. */
  required: boolean,
  /** Function validating the value and returning a string in the case of error. */
  validate?: Validate,
  /** Passed to the `<input>`. */
  type?: HTMLInputTypeAttribute,
} & Pick<ReturnType<typeof useForm>, "errors" | "register">;

// A styled `<input>` element with a label. Displays errors and integrated with
// `react-hook-form`.
export const Input: React.FC<InputProps> = ({
  errors,
  register,
  label,
  name,
  required,
  validate,
  type = 'text',
  ...rest
}) => {
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
            ref={register({
              validate,
              ...required && { required: t('forms-validation-error-required') },
            })}
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
              {errors[name].message}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};
