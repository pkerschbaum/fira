import React from 'react';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import AnnotationContainer from './annotate-page/AnnotationContainer';
import AnnotationInfo from './info-page/AnnotationInfo';
import AnnotationFeedback from './feedback-page/AnnotationFeedback';
import { useUserState } from '../../store/user/user.hooks';
import { useAnnotationState } from '../../store/annotation/annotation.hooks';
import { UserAnnotationAction } from '../../typings/enums';

const ANNOTATE_RELATIVE_URL = 'annotate';
const INFO_RELATIVE_URL = 'info';
const FEEDBACK_RELATIVE_URL = 'feedback';

export function useRouting() {
  const history = useHistory();

  return {
    routeToAnnotatePage: () => {
      history.push(ANNOTATE_RELATIVE_URL);
    },
    routeToInfoPage: () => {
      history.push(INFO_RELATIVE_URL);
    },
  };
}

const AnnotationRouter: React.FC = () => {
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

export default AnnotationRouter;
