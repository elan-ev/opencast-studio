//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';


// A styled `<input>`` element with a label. Displays errors and integrated with
// `react-hook-form`.
//
// Props:
// - `errors` and `register`: the two values returned by `useForm`
// - `label`: the human readable string describing the field
// - `name`, `type` and `rest`: passed as HTML attributes
// - `required`: boolean, whether this field is required or may be empty
// - `validate`: optional, a function validating the value and returning a
//   string in the case of error.
export const Input = ({
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
              ...required ? { required: t('forms-validation-error-required') } : {},
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
