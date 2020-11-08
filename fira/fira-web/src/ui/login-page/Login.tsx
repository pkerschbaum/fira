import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './Login.module.css';
import Form from '../elements/forms/Form';
import { authStories } from '../../stories/auth.stories';
import { RootState } from '../../state/store';
import { HttpStatus } from '../../http/http-status.enum';
import { HttpException } from '../../http/http.exception';

const Login: React.FC = () => {
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

        <Form
          initialValues={{ username: '', password: '' }}
          validate={(values) => {
            const errors: any = {};
            if (!values.username) {
              errors.username = 'Required';
            }
            if (!values.password) {
              errors.password = 'Required';
            }
            return errors;
          }}
          onSubmit={async (values, { setErrors }) => {
            try {
              await authStories.login(values.username, values.password);
              // omit setSubmitting here because if login was successful, it will redirect and thus unmount the component
            } catch (e) {
              if (e instanceof HttpException && e.status === HttpStatus.UNAUTHORIZED) {
                setErrors({ formError: `Credentials invalid.` } as any);
              } else {
                throw e;
              }
            }
          }}
          elements={[
            {
              elementType: 'input',
              label: 'Username',
              htmlProps: {
                name: 'username',
                autoCorrect: 'off',
                autoCapitalize: 'off',
              },
            },
            {
              elementType: 'input',
              label: 'Login-Code',
              htmlProps: {
                name: 'password',
                autoComplete: 'off',
                autoCorrect: 'off',
                autoCapitalize: 'off',
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Login;
