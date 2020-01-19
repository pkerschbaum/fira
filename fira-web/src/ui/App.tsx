import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './App.module.css';
import Login from './Login';
import Admin from './admin/Admin';
import Annotation from './annotation/Annotation';
import PrivateRoute from './PrivateRoute';
import { RootState } from '../store/store';
import { UserRole } from '../store/user/user.slice';
import { assertUnreachable } from '../util/types.util';

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
            <Annotation />
          </PrivateRoute>
        </Switch>
      </Router>
    </div>
  );
};

const RouteToPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  if (!user) {
    return <Redirect to="/login" />;
  } else if (user.role === UserRole.ADMIN) {
    return <Redirect to="/admin" />;
  } else if (user.role === UserRole.ANNOTATOR) {
    return <Redirect to="/annotator" />;
  } else {
    assertUnreachable(user.role);
  }
};

export default App;
