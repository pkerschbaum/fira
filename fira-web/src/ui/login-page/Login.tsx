import React from 'react';
import { Formik, Form, useField, FieldHookConfig } from 'formik';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './Login.module.css';
import { authStories } from '../../stories/auth.stories';
import { RootState } from '../../store/store';
import FloatingTextInput from '../elements/FloatingTextInput';
import Button from '../elements/Button';

const TextInput: React.FC<{ label: string } & FieldHookConfig<any> &
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> = ({
  label,
  ...props
}) => {
  const [field, meta] = useField(props);

  const showError = meta.touched && meta.error;

  return (
    <div>
      <FloatingTextInput
        className={`${styles.inputField} ${showError && styles.inputFieldError}`}
        htmlFor={props.id || props.name}
        label={label}
        {...field}
        {...props}
      />
    </div>
  );
};

const Login = () => {
  const user = useSelector((state: RootState) => state.user);
  const loggedIn = !!user;

  if (loggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headline}>
        <h1>Fira</h1>
        <span>Fine-grained Relevance Annotation</span>
      </div>
      <div className={styles.inputArea}>
        <span className={styles.inputHeadline}>Log in</span>
        <Formik
          initialValues={{ username: '', password: '', loginError: '' }}
          validate={values => {
            const errors: any = {};
            if (!values.username) {
              errors.username = 'Required';
            }
            if (!values.password) {
              errors.password = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              await authStories.login(values.username, values.password);
              // omit setSubmitting here because if login was successful, it will redirect and thus unmount the component
            } catch (e) {
              if (typeof e.getStatus === 'function' && e.getStatus() === 401) {
                setErrors({ loginError: `Credentials invalid.` });
              } else if (
                (typeof e.message === 'string' && /Network Error/i.test(e.message)) ||
                e.code === 'ECONNABORTED'
              ) {
                setErrors({ loginError: `Network error. Please make sure to be online.` });
              } else {
                setErrors({ loginError: `Unexpected error occured during login.` });
              }
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <div className={styles.inputContainer}>
                <TextInput
                  type="text"
                  label="Username"
                  name="username"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <div className={styles.inputDivider} />
                <TextInput
                  type="password"
                  label="Password"
                  name="password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
              {errors.loginError && errors.loginError.length > 0 && (
                <ul className={styles.errorList}>
                  <li>
                    <span>{errors.loginError}</span>
                  </li>
                </ul>
              )}
              <Button
                buttonStyle="bold"
                buttonType="primary"
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Continue
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;