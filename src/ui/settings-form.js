//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { useTranslation } from 'react-i18next';
import useForm from 'react-hook-form';
import { Container, Button } from '@theme-ui/components';

const Input = ({ errors, label, name, register, required, type = 'text', ...rest }) => {
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

function SettingsForm(props) {
  const { t } = useTranslation();
  const { errors, handleSubmit, register, reset } = useForm({
    defaultValues: props.settingsManager.formValues().opencast
  });

  const onSubmit = data => {
    props.handleSubmit(data);
  };

  const onCancel = data => {
    reset();
    props.handleCancel(data);
  };

  const contextSettings = props.settingsManager.contextSettings.opencast || {};

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        { !contextSettings.serverUrl && <Input
          errors={errors}
          label={t('upload-settings-label-server-url')}
          name="serverUrl"
          register={register}
          required
        /> }

        { !contextSettings.workflowId && <Input
          errors={errors}
          label={t('upload-settings-label-workflow-id')}
          name="workflowId"
          register={register}
          required
        /> }

        { !contextSettings.loginName && <Input
          errors={errors}
          label={t('upload-settings-label-username')}
          name="loginName"
          register={register}
          required
        /> }

        { !contextSettings.loginPassword && <Input
          errors={errors}
          label={t('upload-settings-label-password')}
          name="loginPassword"
          register={register}
          required
          type="password"
        /> }

        <footer sx={{ mt: 4 }}>
          <Button>{t('upload-settings-button-store')}</Button>
          {!props.settingsManager.showFirstRunSetup() && (
            <Button variant="text" onClick={onCancel}>
              {t('cancel-button-title')}
            </Button>
          )}
        </footer>
      </form>
    </Container>
  );
}

export default SettingsForm;
