import React from 'react';
import { Formik, FieldHookConfig, useField, FormikValues, Form as FormikForm } from 'formik';

import styles from './Form.module.css';
import Button from '../Button';
import FloatingInput from './FloatingInput';
import { assertUnreachable } from '../../../util/types.util';

const TextInput: React.FC<
  { label: string } & FieldHookConfig<HTMLInputElement> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
> = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  const showError = !!(meta.touched && meta.error);

  return (
    <div>
      <FloatingInput
        childType="input"
        isError={showError}
        htmlFor={props.id || props.name}
        label={label}
        {...field}
        {...props}
      />
    </div>
  );
};

const Textarea: React.FC<
  FieldHookConfig<HTMLTextAreaElement> &
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
> = ({ ...props }) => {
  const [field] = useField(props);

  return (
    <div>
      <FloatingInput childType="textarea" htmlFor={props.id || props.name} {...field} {...props} />
    </div>
  );
};

const Select: React.FC<
  { label: string } & FieldHookConfig<HTMLSelectElement> &
    React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
> = ({ label, ...props }) => {
  const [field] = useField(props);

  return (
    <div>
      <FloatingInput
        childType="select"
        htmlFor={props.id || props.name}
        label={label}
        {...field}
        {...props}
      />
    </div>
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

type SelectElement = {
  readonly elementType: 'select';
  readonly label: string;
  readonly htmlProps: FieldHookConfig<HTMLSelectElement> &
    React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  readonly childElements: React.ReactNode;
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
  readonly elements: Array<InputElement | TextareaElement | SelectElement>;
};

const Form: <T extends FormikValues>(p: FormProps<T>) => React.ReactElement<FormProps<T>> = ({
  initialValues,
  validate,
  onSubmit,
  elements,
}) => {
  return (
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
          }
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors }) => (
        <FormikForm className={styles.form}>
          <div className={styles.inputContainer}>
            {elements.map((el, idx) => {
              const childElem =
                el.elementType === 'input' ? (
                  <TextInput key={idx} label={el.label} {...el.htmlProps} />
                ) : el.elementType === 'select' ? (
                  <Select key={idx} label={el.label} {...el.htmlProps}>
                    {el.childElements}
                  </Select>
                ) : el.elementType === 'textarea' ? (
                  <Textarea key={idx} {...el.htmlProps} />
                ) : (
                  assertUnreachable(el)
                );

              const isLastElem = idx === elements.length - 1;

              return (
                <>
                  {childElem}
                  {/* omit divider for last element */}
                  {isLastElem ? null : <div className={styles.inputDivider} />}
                </>
              );
            })}
          </div>
          {errors.formError && errors.formError.length && errors.formError.length > 0 && (
            <ul className={styles.errorList}>
              <li>
                <span>{errors.formError}</span>
              </li>
            </ul>
          )}
          <Button
            className={styles.button}
            buttonType="primary"
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Continue
          </Button>
        </FormikForm>
      )}
    </Formik>
  );
};

export default Form;
