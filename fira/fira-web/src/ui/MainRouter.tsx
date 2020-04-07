import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect, useLocation } from 'react-router-dom';

import * as config from '../config';
import Dialog from './elements/Dialog';
import Login from './login-page/Login';
import Admin from './admin-page/Admin';
import AnnotationRouter from './annotation-route/AnnotationRouter';
import RoleRoute from './RoleRoute';
import { useUserState } from '../store/user/user.hooks';
import { useKeyupEvent } from './util/events.hooks';
import { assertUnreachable } from '../util/types.util';
import { browserStorage } from '../browser-storage/browser-storage';
import { UserRole } from '../typings/enums';

// URL_REGEX taken from https://stackoverflow.com/a/26766402/1700319
const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
const PATH_NAME = URL_REGEX.exec(config.application.homepage)?.[5];

const KEY_H_CODE = 'KeyH';

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

const MainSwitch: React.FC = () => {
  const showClientId = new URLSearchParams(useLocation().search).get('showClientId') === 'true';
  const [dialogOpen, setDialogOpen] = useState(showClientId);

  useKeyupEvent({
    [KEY_H_CODE]: { additionalKeys: ['ALT'], handler: () => setDialogOpen((oldVal) => !oldVal) },
  });

  return (
    <>
      {dialogOpen && (
        <Dialog onClose={() => setDialogOpen(false)}>
          Your client id is: <strong>{browserStorage.getClientId()}</strong>
        </Dialog>
      )}
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
    </>
  );
};

const MainRouter: React.FC = () => {
  return (
    <BrowserRouter basename={PATH_NAME}>
      <MainSwitch />
    </BrowserRouter>
  );
};

export default MainRouter;
