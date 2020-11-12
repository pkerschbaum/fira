import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import TextBox from '../elements/TextBox';
import Form from '../elements/forms/Form';
import Stack from '../layouts/Stack';
import { authStories } from '../../stories/auth.stories';
import { RootState } from '../../state/store';
import { HttpStatus } from '../../http/http-status.enum';
import { HttpException } from '../../http/http.exception';

import { styles } from './Login.styles';
import { commonStyles } from '../Common.styles';

const Login: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const loggedIn = !!user;

  if (loggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Stack justifyContent="center" css={commonStyles.fullHeight}>
      <Stack spacing={3}>
        <Stack>
          <TextBox fontSize="xxl" bold css={styles.headline}>
            Fira
          </TextBox>
          <TextBox>Fine-grained Relevance Annotation</TextBox>
        </Stack>
        <Stack justifyContent="center">
          <TextBox bold fontSize="lg">
            Log in
          </TextBox>
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
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Login;
