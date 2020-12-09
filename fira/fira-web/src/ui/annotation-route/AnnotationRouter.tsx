import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Annotation from './annotate-page/Annotation';
import AnnotationHistory from './history-page/AnnotationHistory';
import EditAnnotation from './edit-annotation-page/EditAnnotation';
import AnnotationInfo from './info-page/AnnotationInfo';
import AnnotationFeedback from './feedback-page/AnnotationFeedback';
import AnnotationFinished from './finished-page/AnnotationFinished';
import AnnotationEverythingAnnotated from './everything-annotated-page/AnnotationEverythingAnnotated';
import { useUserState } from '../../state/user/user.hooks';
import { useAnnotationState } from '../../state/annotation/annotation.hooks';
import { assertUnreachable, routes } from '@fira-commons';

const AnnotationRouter: React.FC = () => {
  const { userAcknowledgedInfoPage, userAcknowledgedFinishedPage } = useUserState();
  const {
    remainingToFinish,
    remainingUntilFirstFeedbackRequired,
    countOfFeedbacks,
    annotationDataReceivedFromServer,
    countOfNotPreloadedPairs,
    pairsToJudge,
  } = useAnnotationState();

  const redirectToDefault = <Redirect to={routes.ANNOTATION.annotate} />;

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
      <Route path={routes.ANNOTATION.annotate}>
        {pageToShow === 'INFO_PAGE' ? (
          // on this device, the info page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={routes.ANNOTATION.info} />
        ) : pageToShow === 'FEEDBACK_PAGE' ? (
          // user must submit a feedback
          <Redirect to={routes.ANNOTATION.feedback} />
        ) : pageToShow === 'FINISHED_PAGE' ? (
          // user finished annotation target and the finished page was never shown and
          // acknowledged by the user --> show page
          <Redirect to={routes.ANNOTATION.finished} />
        ) : pageToShow === 'EVERYTHING_ANNOTATED_PAGE' ? (
          <Redirect to={routes.ANNOTATION.everythingAnnotated} />
        ) : pageToShow === 'ANNOTATION_PAGE' ? (
          <Annotation />
        ) : (
          assertUnreachable(pageToShow)
        )}
      </Route>
      <Route path={routes.ANNOTATION.history()}>
        <AnnotationHistory />
      </Route>
      <Route path={routes.ANNOTATION.edit(':id')}>
        <EditAnnotation />
      </Route>
      <Route path={routes.ANNOTATION.info}>
        <AnnotationInfo />
      </Route>
      <Route path={routes.ANNOTATION.feedback}>
        {pageToShow !== 'FEEDBACK_PAGE' ? redirectToDefault : <AnnotationFeedback />}
      </Route>
      <Route path={routes.ANNOTATION.finished}>
        {pageToShow !== 'FINISHED_PAGE' ? redirectToDefault : <AnnotationFinished />}
      </Route>
      <Route path={routes.ANNOTATION.everythingAnnotated}>
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
