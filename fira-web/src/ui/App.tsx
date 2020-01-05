import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

import styles from './App.module.css';
import Login from '../Login';
import Admin from './admin/Admin';
import { RootState } from '../store/store';

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
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/annotator">
            <div>Annotator page</div>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

const RouteToPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  if (!user) {
    return <Redirect to="/login" />;
  } else if (user.role === 'admin') {
    return <Redirect to="/admin" />;
  } else {
    // user.role === 'annotator'
    return <Redirect to="/annotator" />;
  }
};

export default App;
