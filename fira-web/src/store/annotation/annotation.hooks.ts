import { useSelector } from 'react-redux';

import { actions, JudgementPairStatus } from './annotation.slice';
import { RootState } from '../store';
import { useActionsWithDispatch } from '../util/actions.util';

export const useAnnotationActions = () => useActionsWithDispatch(actions);

export const useAnnotationState = () => {
  const pairsSuccessfullySent = useSelector((state: RootState) =>
    state.annotation.judgementPairs.filter(
      pair => pair.status === JudgementPairStatus.SEND_SUCCESS,
    ),
  );

  const remainingToFinish = useSelector((state: RootState) => {
    return state.annotation.remainingToFinish === undefined
      ? undefined
      : state.annotation.remainingToFinish - pairsSuccessfullySent.length;
  });
  const alreadyFinished = useSelector((state: RootState) => {
    return state.annotation.alreadyFinished === undefined
      ? undefined
      : state.annotation.alreadyFinished + pairsSuccessfullySent.length;
  });
  const currentJudgementPair = useSelector((state: RootState) =>
    state.annotation.judgementPairs.find(
      pair => pair.id === state.annotation.currentJudgementPairId,
    ),
  );

  return {
    remainingToFinish,
    alreadyFinished,
    currentJudgementPair,
  };
};
