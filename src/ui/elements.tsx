//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { HTMLInputTypeAttribute } from 'react';
import AsyncSelect from 'react-select/async';
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


type SelectProps<I extends FieldValues, F> =
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
  disabled?: boolean,
  clearable?: boolean,
  placeholder: string,
  options?: F[],
  defaultOptions: boolean,
  loadOptions: (input: string, callback: (options: readonly F[]) => void) => void;
  defaultValue?: F,
  onChange?: any,
  value?: F,
  control?: any,
};


// A styled `<Dropdown>`` element with a label. Displays errors and integrated with
// `react-hook-form`.
//
// Props:
// - `errors` and `register`: the two values returned by `useForm`
// - `label`: the human readable string describing the field
// - `name`, `type` and `rest`: passed as HTML attributes
// - `required`: boolean, whether this field is required or may be empty
// - `validate`: optional, a function validating the value and returning a
//   string in the case of error.

export const Dropdown = <I extends FieldValues, F> ({
  errors,
  register,
  label,
  name,
  required,
  validate,
  clearable,
  type = 'select',
  disabled,
  options,
  defaultValue,
  defaultOptions,
  value,
  control,
  ...rest
}: SelectProps<I, F>) => {
  const { t } = useTranslation();

  const selectStyles = {
    control: (styles, state) => ({
      ...styles,
      backgroundColor: 'var(--theme-ui-colors-element_bg)',
      borderColor: errors[name] ? 'var(--theme-ui-colors-error)' :
        state.isFocused ? 'var(--theme-ui-colors-primary)' : 'var(--theme-ui-colors-gray-2)',
      borderRadius: '2px',
      minHeight: '2rem',
      height: '2rem',
      outline: state.isFocused ? '5px solid var(--theme-ui-colors-focus-0)' : 'none',
      outlineOffset: '-5px',
      boxShadow: errors[name] ? '0 0 3px 0 var(--theme-ui-colors-error)' :
        state.isFocused ? '0 0 3px 0 var(--theme-ui-colors-focus-0)' : 'none',
      fontWeight: 'normal',
    }),

    valueContainer: (provided, state) => ({
      ...provided,
      height: '2rem',
      padding: '0 6px'
    }),

    input: (provided, state) => ({
      ...provided,
      margin: '0px',
    }),
    indicatorSeparator: state => ({
      display: 'none',
    }),
    indicatorsContainer: (provided, state) => ({
      ...provided,
      height: '2rem',
    }),
  };

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
          <AsyncSelect
            cacheOptions
            className="dropdown-container"
            classNamePrefix="dropdown"
            isDisabled={disabled}
            isSearchable={true}
            isClearable={clearable}
            aria-invalid={errors[name] ? 'true' : 'false'}
            aria-describedby={`${name}Error`}
            options={options}
            styles={selectStyles}
            defaultValue={defaultValue}
            defaultOptions
            sx={{
              variant: 'styles.dropdown',
            }}
            {...register(name, { validate, ...required ? { required: t('forms-validation-error-required') } : {}, })}
            {...rest}/>

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
              {errors[name]?.message}
            </p>
          )}
        </div>
      </label>
    </div>
  );
};

export interface SeriesOption {
  readonly value: string;
  readonly label: string;
}


export const SeriesDropdown = <I extends FieldValues, SeriesOption> ({ ...rest }: SelectProps<I, SeriesOption>) => {
  return <Dropdown
    { ...rest }
  />;
};
