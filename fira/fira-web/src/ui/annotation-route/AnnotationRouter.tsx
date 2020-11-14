import React from 'react';
import { Switch, Route, Redirect, useRouteMatch, useHistory } from 'react-router-dom';

import Annotation from './annotate-page/Annotation';
import AnnotationHistory from './history-page/AnnotationHistory';
import AnnotationInfo from './info-page/AnnotationInfo';
import AnnotationFeedback from './feedback-page/AnnotationFeedback';
import AnnotationFinished from './finished-page/AnnotationFinished';
import AnnotationEverythingAnnotated from './everything-annotated-page/AnnotationEverythingAnnotated';
import { useUserState } from '../../state/user/user.hooks';
import { useAnnotationState } from '../../state/annotation/annotation.hooks';
import { assertUnreachable } from '../../../../fira-commons';

const ANNOTATE_RELATIVE_URL = 'annotate';
const HISTORY_RELATIVE_URL = 'history';
const INFO_RELATIVE_URL = 'info';
const FEEDBACK_RELATIVE_URL = 'feedback';
const FINISHED_RELATIVE_URL = 'finished';
const EVERYTHING_ANNOTATED_RELATIVE_URL = 'everything-finished';

export function useRouting() {
  const history = useHistory();

  return {
    routeToAnnotatePage: () => {
      history.push(ANNOTATE_RELATIVE_URL);
    },
    routeToHistoryPage: () => {
      history.push(HISTORY_RELATIVE_URL);
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
    remainingUntilFirstFeedbackRequired,
    countOfFeedbacks,
    annotationDataReceivedFromServer,
    countOfNotPreloadedPairs,
    pairsToJudge,
  } = useAnnotationState();

  const redirectToDefault = <Redirect to={`${match.path}/${ANNOTATE_RELATIVE_URL}`} />;

  const pageToShow = !annotationDataReceivedFromServer
    ? 'ANNOTATION_PAGE'
    : remainingToFinish! > 0 && !userAcknowledgedInfoPage
    ? 'INFO_PAGE'
    : (remainingUntilFirstFeedbackRequired! <= 0 && countOfFeedbacks! < 1) ||
      (remainingToFinish! <= 0 && countOfFeedbacks! < 2)
    ? 'FEEDBACK_PAGE'
    : remainingToFinish! <= 0 && !userAcknowledgedFinishedPage
    ? 'FINISHED_PAGE'
    : countOfNotPreloadedPairs! <= 0 && pairsToJudge.length === 0
    ? 'EVERYTHING_ANNOTATED_PAGE'
    : 'ANNOTATION_PAGE';

  return (
    <Switch>
      <Route path={`${match.path}/${ANNOTATE_RELATIVE_URL}`}>
        {pageToShow === 'INFO_PAGE' ? (
          // on this device, the info page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={`${match.path}/${INFO_RELATIVE_URL}`} />
        ) : pageToShow === 'FEEDBACK_PAGE' ? (
          // user must submit a feedback
          <Redirect to={`${match.path}/${FEEDBACK_RELATIVE_URL}`} />
        ) : pageToShow === 'FINISHED_PAGE' ? (
          // user finished annotation target and the finished page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={`${match.path}/${FINISHED_RELATIVE_URL}`} />
        ) : pageToShow === 'EVERYTHING_ANNOTATED_PAGE' ? (
          <Redirect to={`${match.path}/${EVERYTHING_ANNOTATED_RELATIVE_URL}`} />
        ) : pageToShow === 'ANNOTATION_PAGE' ? (
          <Annotation />
        ) : (
          assertUnreachable(pageToShow)
        )}
      </Route>
      <Route path={`${match.path}/${HISTORY_RELATIVE_URL}`}>
        <AnnotationHistory />
      </Route>
      <Route path={`${match.path}/${INFO_RELATIVE_URL}`}>
        <AnnotationInfo />
      </Route>
      <Route path={`${match.path}/${FEEDBACK_RELATIVE_URL}`}>
        {pageToShow !== 'FEEDBACK_PAGE' ? redirectToDefault : <AnnotationFeedback />}
      </Route>
      <Route path={`${match.path}/${FINISHED_RELATIVE_URL}`}>
        {pageToShow !== 'FINISHED_PAGE' ? redirectToDefault : <AnnotationFinished />}
      </Route>
      <Route path={`${match.path}/${EVERYTHING_ANNOTATED_RELATIVE_URL}`}>
        {pageToShow !== 'EVERYTHING_ANNOTATED_PAGE' ? (
          redirectToDefault
        ) : (
          <AnnotationEverythingAnnotated />
        )}
      </Route>
      {redirectToDefault}
    </Switch>
  );
};

export default AnnotationRouter;
