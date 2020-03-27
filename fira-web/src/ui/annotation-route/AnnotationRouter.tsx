import React from 'react';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import Annotation from './annotate-page/Annotation';
import AnnotationInfo from './info-page/AnnotationInfo';
import AnnotationFeedback from './feedback-page/AnnotationFeedback';
import AnnotationFinished from './finished-page/AnnotationFinished';
import { useUserState } from '../../store/user/user.hooks';
import { useAnnotationState } from '../../store/annotation/annotation.hooks';
import { UserAnnotationAction } from '../../typings/enums';

const ANNOTATE_RELATIVE_URL = 'annotate';
const INFO_RELATIVE_URL = 'info';
const FINISHED_RELATIVE_URL = 'finished';
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
  const { userAcknowledgedInfoPage, userAcknowledgedFinishedPage } = useUserState();
  const {
    remainingToFinish,
    nextUserAction,
    annotationDataReceivedFromServer,
  } = useAnnotationState();

  const redirectToDefault = <Redirect to={`${match.path}/${ANNOTATE_RELATIVE_URL}`} />;

  return (
    <Switch>
      <Route path={`${match.path}/${ANNOTATE_RELATIVE_URL}`}>
        {annotationDataReceivedFromServer &&
        !(remainingToFinish !== undefined && remainingToFinish <= 0) &&
        !userAcknowledgedInfoPage ? (
          // on this device, the info page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={`${match.path}/${INFO_RELATIVE_URL}`} />
        ) : nextUserAction === UserAnnotationAction.SUBMIT_FEEDBACK ? (
          // user must submit a feedback
          <Redirect to={`${match.path}/${FEEDBACK_RELATIVE_URL}`} />
        ) : annotationDataReceivedFromServer &&
          remainingToFinish !== undefined &&
          remainingToFinish <= 0 &&
          !userAcknowledgedFinishedPage ? (
          // user finished annotation target and did not acknowledge finished page on this device yet
          // acknowledged by the user --> show page
          <Redirect to={`${match.path}/${FINISHED_RELATIVE_URL}`} />
        ) : (
          <Annotation />
        )}
      </Route>
      <Route path={`${match.path}/${INFO_RELATIVE_URL}`}>
        <AnnotationInfo />
      </Route>
      <Route path={`${match.path}/${FINISHED_RELATIVE_URL}`}>
        <AnnotationFinished />
      </Route>
      <Route path={`${match.path}/${FEEDBACK_RELATIVE_URL}`}>
        {nextUserAction !== UserAnnotationAction.SUBMIT_FEEDBACK ? (
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
