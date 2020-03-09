import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import Login from './login-page/Login';
import Admin from './admin-page/Admin';
import AnnotationRouter from './annotation-route/AnnotationRouter';
import RoleRoute from './RoleRoute';
import { useUserState } from '../store/user/user.hooks';
import { UserRole } from '../typings/enums';
import { assertUnreachable } from '../util/types.util';

const RedirectDependingOnUserRole: React.FC = () => {
  const { userRole } = useUserState();

  if (!userRole) {
    return <Redirect to="/login" />;
  } else if (userRole === UserRole.ADMIN) {
    return <Redirect to="/admin" />;
  } else if (userRole === UserRole.ANNOTATOR) {
    return <Redirect to="/annotator" />;
  } else {
    assertUnreachable(userRole);
  }
};

const MainRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          <RedirectDependingOnUserRole />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <RoleRoute path="/admin" requiredRole={UserRole.ADMIN}>
          <Admin />
        </RoleRoute>
        <RoleRoute path="/annotator" requiredRole={UserRole.ANNOTATOR}>
          <AnnotationRouter />
        </RoleRoute>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
};

export default MainRouter;
