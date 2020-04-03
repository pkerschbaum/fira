import { useSelector } from 'react-redux';

import { actions, JudgementPairStatus } from './annotation.slice';
import { RootState } from '../store';
import { useActionsWithDispatch } from '../util/actions.util';

export const annotationComputations = {
  annotationDataReceivedFromServer: (state: RootState) =>
    state.annotation.remainingToFinish !== undefined,
};

export const useAnnotationActions = () => useActionsWithDispatch(actions);

export const useAnnotationState = () => {
  const pairsSuccessfullySent = useSelector((state: RootState) =>
    state.annotation.judgementPairs.filter(
      (pair) => pair.status === JudgementPairStatus.SEND_SUCCESS,
    ),
  );
  const pairsCurrentlySending = useSelector((state: RootState) =>
    state.annotation.judgementPairs.filter(
      (pair) => pair.status === JudgementPairStatus.SEND_PENDING,
    ),
  );
  const pairsToJudge = useSelector((state: RootState) =>
    state.annotation.judgementPairs.filter((pair) => pair.status === JudgementPairStatus.TO_JUDGE),
  );
  const currentJudgementPair = useSelector((state: RootState) =>
    state.annotation.judgementPairs.find(
      (pair) => pair.id === state.annotation.currentJudgementPairId,
    ),
  );
  const pairsJudged = pairsSuccessfullySent.concat(pairsCurrentlySending);

  const annotationDataReceivedFromServer = useSelector(
    annotationComputations.annotationDataReceivedFromServer,
  );
  const remainingToFinish = useSelector((state: RootState) =>
    !annotationDataReceivedFromServer
      ? undefined
      : state.annotation.remainingToFinish! - pairsJudged.length,
  );
  const remainingUntilFirstFeedbackRequired = useSelector((state: RootState) =>
    !annotationDataReceivedFromServer
      ? undefined
      : state.annotation.remainingUntilFirstFeedbackRequired! - pairsJudged.length,
  );
  const countOfFeedbacks = useSelector((state: RootState) => state.annotation.countOfFeedbacks);
  const countOfNotPreloadedPairs = useSelector(
    (state: RootState) => state.annotation.countOfNotPreloadedPairs,
  );
  const alreadyFinished = useSelector((state: RootState) =>
    !annotationDataReceivedFromServer
      ? undefined
      : state.annotation.alreadyFinished! + pairsJudged.length,
  );

  return {
    annotationDataReceivedFromServer,
    remainingToFinish,
    remainingUntilFirstFeedbackRequired,
    countOfFeedbacks,
    countOfNotPreloadedPairs,
    pairsToJudge,
    alreadyFinished,
    currentJudgementPair,
  };
};
