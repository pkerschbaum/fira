import { createLogger } from '../../logger/logger';
import { RootStore } from '../store';
import { judgementStories } from '../../stories/judgement.stories';
import { actions as annotationActions, JudgementPairStatus } from '../annotation/annotation.slice';
import { UserRole, UserAnnotationAction } from '../../typings/enums';

const PRELOAD_JUDGEMENTS_THRESHOLD = 1;

const logger = createLogger('annotation.subscriptions');

export const setupSubscriptions = (store: RootStore) => {
  // if no judgement pairs got loaded from the server yet, preload pairs
  store.subscribe(() => {
    const annotationState = store.getState().annotation;

    const user = store.getState().user;
    if (!user || !user.accessToken) {
      logger.info(
        'no judgement pairs got loaded from the server yet, but there is no access token available --> skip preload',
      );
      return;
    }
    if (user.role !== UserRole.ANNOTATOR) {
      logger.info(
        'no judgement pairs got loaded from the server yet, but user role is not annotator --> skip preload',
      );
      return;
    }

    if (annotationState.remainingToFinish === undefined) {
      logger.info('no judgement pairs got loaded from the server yet --> execute preload...');
      judgementStories.preloadJudgements();
    }
  });

  // retrieve judgement pairs from server if count of (local) judgement pairs does not fulfill threshold,
  // and the user did not annotate every possible judgement pair
  const retrieveJudgPairsSubscription: MemoizedSubscription = {
    memoizeOnValue: (subscribedStore) => subscribedStore.getState().annotation.judgementPairs,
    listener: (subscribedStore) => {
      const annotationState = subscribedStore.getState().annotation;
      const nextUserAction = annotationState.nextUserAction;
      const countOfOpenJudgementPairs = annotationState.judgementPairs.filter(
        (pair) =>
          pair.status === JudgementPairStatus.TO_JUDGE ||
          pair.status === JudgementPairStatus.SEND_PENDING,
      ).length;
      if (
        nextUserAction === UserAnnotationAction.PAIRS_LEFT_TO_PRELOAD &&
        annotationState.remainingToFinish !== undefined &&
        countOfOpenJudgementPairs <= PRELOAD_JUDGEMENTS_THRESHOLD
      ) {
        logger.info(
          'count of preloaded judgement pairs does not fulfill threshold and ' +
            'there are remaining judgements to preload on the server --> execute preload...',
        );
        judgementStories.preloadJudgements();
      }
    },
  };
  addMemoizedSubscription(store, retrieveJudgPairsSubscription);

  // set new currently selected judgement pair if list of judgement pairs changes
  const setNextSelectedPairSubscription: MemoizedSubscription = {
    memoizeOnValue: (subscribedStore) => subscribedStore.getState().annotation.judgementPairs,
    listener: (subscribedStore) => {
      const judgePairsOfStore = subscribedStore.getState().annotation.judgementPairs;

      // select first pair which neither gets currently sent to the server nor was already sent to the server
      const nextPair = judgePairsOfStore.find(
        (pair) => pair.status === JudgementPairStatus.TO_JUDGE,
      );
      subscribedStore.dispatch(annotationActions.selectJudgementPair(nextPair));
    },
  };
  addMemoizedSubscription(store, setNextSelectedPairSubscription);
};

type MemoizedSubscription = {
  memoizeOnValue: (subscribedStore: RootStore) => any;
  listener: (subscribedStore: RootStore) => void;
};

function addMemoizedSubscription(store: RootStore, subscription: MemoizedSubscription) {
  let memoizedValue = subscription.memoizeOnValue(store);
  store.subscribe(() => {
    const newValueOfStore = subscription.memoizeOnValue(store);
    if (memoizedValue !== newValueOfStore) {
      memoizedValue = newValueOfStore;
      subscription.listener(store);
    }
  });
}
