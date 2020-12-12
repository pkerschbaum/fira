import React from 'react';
import { TextField } from '@material-ui/core';
import { Formik, FieldHookConfig, useField, FormikValues, Form as FormikForm } from 'formik';

import Button from '../Button';
import TextBox from '../TextBox';
import SelectInput from './SelectInput';
import Stack from '../../layouts/Stack';
import { assertUnreachable } from '@fira-commons';

import { styles } from './Form.styles';

const TextInput: React.FC<
  { label: string } & FieldHookConfig<HTMLInputElement> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  const showError = !!(meta.touched && meta.error);

  return (
    <TextField
      error={showError}
      helperText={!showError ? undefined : meta.error}
      {...field}
      size="small"
      variant="outlined"
      label={label}
      css={styles.input}
      inputProps={props}
    />
  );
};

const TextareaInput: React.FC<
  FieldHookConfig<any> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
> = ({ ...props }) => {
  const [field, meta] = useField(props);

  const showError = !!(meta.touched && meta.error);

  return (
    <TextField
      error={showError}
      helperText={!showError ? undefined : meta.error}
      {...field}
      variant="outlined"
      multiline
      minRows={3}
      css={styles.input}
      inputProps={props}
    />
  );
};

type Errors = {
  [field: string]: string;
};

type InputElement = {
  readonly elementType: 'input';
  readonly label: string;
  readonly htmlProps: FieldHookConfig<HTMLInputElement> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
};

type TextareaElement = {
  readonly elementType: 'textarea';
  readonly htmlProps: FieldHookConfig<HTMLTextAreaElement> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
};

type SelectElement<ItemValue> = {
  readonly elementType: 'select';
  readonly label: string;
  readonly name: string;
  readonly availableValues: Array<{
    value: ItemValue;
    label: string;
  }>;
  readonly onValueChange?: (val: ItemValue) => void;
};

type FormProps<V extends FormikValues> = {
  readonly initialValues: V;
  readonly validate?: (values: V) => Errors;
  readonly onSubmit: (
    values: V,
    formHelpers: {
      setSubmitting: (arg: boolean) => void;
      setErrors: (arg: V & { formError: string }) => void;
    },
  ) => Promise<void>;
  readonly elements: Array<InputElement | TextareaElement | SelectElement<any>>;
};

const Form: <T extends FormikValues>(p: FormProps<T>) => React.ReactElement<FormProps<T>> = ({
  initialValues,
  validate,
  onSubmit,
  elements,
}) => (
  <Formik
    initialValues={{ ...initialValues, formError: '' }}
    validate={validate}
    onSubmit={async (values, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(values, { setSubmitting, setErrors });
      } catch (e) {
        if (
          (typeof e.message === 'string' && /Network Error/i.test(e.message)) ||
          e.code === 'ECONNABORTED'
        ) {
          setErrors({ formError: `Network error. Please make sure to be online.` } as any);
        } else {
          setErrors({ formError: `Unexpected error occured.` } as any);
          throw e;
        }
      } finally {
        setSubmitting(false);
      }
    }}
  >
    {({ isSubmitting, errors }) => (
      <FormikForm css={styles.form}>
        <Stack spacing={2} alignItems="stretch">
          <Stack spacing={1.5}>
            {elements.map((el, idx) => {
              return el.elementType === 'input' ? (
                <TextInput key={idx} label={el.label} {...el.htmlProps} />
              ) : el.elementType === 'select' ? (
                <SelectInput
                  key={idx}
                  label={el.label}
                  name={el.name}
                  availableValues={el.availableValues}
                  onValueChange={el.onValueChange}
                />
              ) : el.elementType === 'textarea' ? (
                <TextareaInput key={idx} {...el.htmlProps} />
              ) : (
                assertUnreachable(el)
              );
            })}
          </Stack>
          {errors.formError && errors.formError.length && errors.formError.length > 0 && (
            <ul css={styles.errorList}>
              <li>
                <TextBox component="span">{errors.formError}</TextBox>
              </li>
            </ul>
          )}
          <Button variant="contained" type="submit" isLoading={isSubmitting}>
            Continue
          </Button>
        </Stack>
      </FormikForm>
    )}
  </Formik>
);

export default Form;
