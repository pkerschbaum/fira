import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';

import styles from './App.module.css';
import Login from './login/Login';
import Admin from './admin/Admin';
import AnnotationContainer from './annotation/AnnotationContainer';
import AnnotationInfo from './annotation/info-page/AnnotationInfo';
import AnnotationFeedback from './annotation/feedback-page/AnnotationFeedback';
import PrivateRoute from './PrivateRoute';
import { UserRole } from '../store/user/user.slice';
import { useUserState } from '../store/user/user.hooks';
import { useAnnotationState } from '../store/annotation/annotation.hooks';
import { assertUnreachable } from '../util/types.util';
import { UserAnnotationAction } from '../typings/enums';

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
export const FEEDBACK_RELATIVE_URL = 'feedback';

const AnnotatorRouter: React.FC = () => {
  const match = useRouteMatch();
  const { userAcknowledgedInfoPage } = useUserState();
  const { requiredUserAction } = useAnnotationState();

  const redirectToDefault = <Redirect to={`${match.path}/${ANNOTATE_RELATIVE_URL}`} />;

  return (
    <Switch>
      <Route path={`${match.path}/${ANNOTATE_RELATIVE_URL}`}>
        {!userAcknowledgedInfoPage ? (
          // on this device, the info page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={`${match.path}/${INFO_RELATIVE_URL}`} />
        ) : requiredUserAction === UserAnnotationAction.SUBMIT_FEEDBACK ? (
          <Redirect to={`${match.path}/${FEEDBACK_RELATIVE_URL}`} />
        ) : (
          <AnnotationContainer />
        )}
      </Route>
      <Route path={`${match.path}/${INFO_RELATIVE_URL}`}>
        <AnnotationInfo />
      </Route>
      <Route path={`${match.path}/${FEEDBACK_RELATIVE_URL}`}>
        {requiredUserAction !== UserAnnotationAction.SUBMIT_FEEDBACK ? (
          redirectToDefault
        ) : (
          <AnnotationFeedback />
        )}
      </Route>
      {redirectToDefault}
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
