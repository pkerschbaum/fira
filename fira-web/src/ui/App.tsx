import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import styles from './App.module.css';
import Login from './login/Login';
import Admin from './admin/Admin';
import AnnotationContainer from './annotation/AnnotationContainer';
import AnnotationInfo from './annotation/AnnotationInfo';
import PrivateRoute from './PrivateRoute';
import { UserRole } from '../store/user/user.slice';
import { useUserState } from '../store/user/user.hooks';
import { assertUnreachable } from '../util/types.util';

const RouteToPage: React.FC = () => {
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

export const ANNOTATE_RELATIVE_URL = 'annotate';
export const INFO_RELATIVE_URL = 'info';

const AnnotatorRouter: React.FC = () => {
  const match = useRouteMatch();
  const { userAcknowledgedInfoScreen } = useUserState();

  return (
    <Switch>
      <Route path={`${match.path}/${ANNOTATE_RELATIVE_URL}`}>
        {!userAcknowledgedInfoScreen ? (
          // on this device, the info screen was never shown and
          // acknowledged by the user --> show screen
          <Redirect to={`${match.path}/${INFO_RELATIVE_URL}`} />
        ) : (
          <AnnotationContainer />
        )}
      </Route>
      <Route path={`${match.path}/${INFO_RELATIVE_URL}`}>
        <AnnotationInfo />
      </Route>
      <Redirect to={`${match.path}/${ANNOTATE_RELATIVE_URL}`} />
    </Switch>
  );
};

const App: React.FC = () => {
  return (
    <div className={styles.app}>
      <Router>
        <Switch>
          <Route exact path="/">
            <RouteToPage />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <PrivateRoute path="/admin" requiredRole={UserRole.ADMIN}>
            <Admin />
          </PrivateRoute>
          <PrivateRoute path="/annotator" requiredRole={UserRole.ANNOTATOR}>
            <AnnotatorRouter />
          </PrivateRoute>
          <Redirect to="/" />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
