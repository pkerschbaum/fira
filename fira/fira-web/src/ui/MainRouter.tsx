import React, { useState } from 'react';
import { BrowserRouter, Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom';

import * as config from '../config';
import Dialog from './elements/Dialog';
import Login from './login-page/Login';
import Admin from './admin-page/Admin';
import AnnotationRouter from './annotation-route/AnnotationRouter';
import RoleRoute from './RoleRoute';
import { useUserState } from '../state/user/user.hooks';
import { useKeyupHandler } from './util/events.hooks';
import { browserStorage } from '../browser-storage/browser-storage';
import { UserRole } from '../typings/enums';
import { assertUnreachable, routes } from '../../../fira-commons';

// URL_REGEX taken from https://stackoverflow.com/a/26766402/1700319
const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
const PATH_NAME = URL_REGEX.exec(config.application.homepage)?.[5];

export function useRouting() {
  const history = useHistory();

  function routeUsingHistory(absolutePath: string) {
    history.push(absolutePath);
  }

  return {
    route: {
      annotation: {
        toAnnotatePage: () => routeUsingHistory(routes.ANNOTATION.annotate),
        toHistoryPage: () => routeUsingHistory(routes.ANNOTATION.history),
        toEditPage: (judgementId: string | number) =>
          routeUsingHistory(routes.ANNOTATION.edit(judgementId)),
        toInfoPage: () => routeUsingHistory(routes.ANNOTATION.info),
      },
    },
  };
}

const RedirectDependingOnUserRole: React.FC = () => {
  const { userRole } = useUserState();

  if (!userRole) {
    return <Redirect to={routes.LOGIN.base} />;
  } else if (userRole === UserRole.ADMIN) {
    return <Redirect to={routes.ADMIN.base} />;
  } else if (userRole === UserRole.ANNOTATOR) {
    return <Redirect to={routes.ANNOTATION.base} />;
  } else {
    assertUnreachable(userRole);
  }
};

const MainSwitch: React.FC = () => {
  const showClientId = new URLSearchParams(useLocation().search).get('showClientId') === 'true';
  const [dialogOpen, setDialogOpen] = useState(showClientId);

  useKeyupHandler({
    [config.application.helpDialog.shortcut.key]: {
      additionalKeys: config.application.helpDialog.shortcut.additionalKeys,
      handler: () => setDialogOpen((oldVal) => !oldVal),
    },
  });

  return (
    <>
      <Dialog
        id="support-dialog"
        title="Information for support"
        confirmationButtonLabel="Close"
        hideAbortButton
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        Your client id is: <strong>{browserStorage.getClientId()}</strong>
      </Dialog>
      <Switch>
        <Route exact path="/">
          <RedirectDependingOnUserRole />
        </Route>
        <Route path={routes.LOGIN.base}>
          <Login />
        </Route>
        <RoleRoute path={routes.ADMIN.base} requiredRole={UserRole.ADMIN}>
          <Admin />
        </RoleRoute>
        <RoleRoute path={routes.ANNOTATION.base} requiredRole={UserRole.ANNOTATOR}>
          <AnnotationRouter />
        </RoleRoute>
        <Redirect to="/" />
      </Switch>
    </>
  );
};

const MainRouter: React.FC = () => (
  <BrowserRouter basename={PATH_NAME}>
    <MainSwitch />
  </BrowserRouter>
);

export default MainRouter;
