import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import styles from './App.module.css';
import Login from './login/Login';
import Admin from './admin/Admin';
import AnnotationContainer from './annotation/AnnotationContainer';
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
            <AnnotationContainer />
          </PrivateRoute>
          <Redirect to="/" />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
