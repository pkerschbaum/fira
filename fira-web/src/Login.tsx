import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { authService } from './auth/auth.service';
import { RootState } from './store/store';

const Login = () => {
  const user = useSelector((state: RootState) => state.user);
  const loggedIn = !!user;

  if (loggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      <Formik
        initialValues={{ username: '', password: '' }}
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
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await authService.login(values.username, values.password);
            // omit setSubmitting here because if login was successful, it will redirect and thus unmount the component
          } catch {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Field type="text" name="username" />
            <ErrorMessage name="username" component="div" />
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" />
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
      <div>Login state: {`${loggedIn}`}</div>
    </div>
  );
};

export default Login;
