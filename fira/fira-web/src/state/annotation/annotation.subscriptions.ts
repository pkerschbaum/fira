import { createLogger } from '../../commons/logger';
import { RootStore } from '../store';
import { judgementStories } from '../../stories/judgement.stories';
import { actions as annotationActions, JudgementPairStatus } from '../annotation/annotation.slice';
import { UserRole } from '../../typings/enums';
import { annotationComputations } from './annotation.hooks';

const PRELOAD_JUDGEMENTS_THRESHOLD = 1;

const logger = createLogger('annotation.subscriptions');

export const setupSubscriptions = (store: RootStore) => {
  // if no judgement pairs got loaded from the server yet, execute initial preload of judgement pairs
  const initialPreloadSubscription: MemoizedSubscription = {
    memoizeOnValue: (subscribedStore) => subscribedStore.getState().user?.accessToken.val,
    listener: async (subscribedStore) => {
      const user = subscribedStore.getState().user;
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

      if (!annotationComputations.annotationDataReceivedFromServer(subscribedStore.getState())) {
        logger.info('no judgement pairs got loaded from the server yet --> execute preload...');
        await judgementStories.preloadJudgements();
      }
    },
  };
  addMemoizedSubscription(store, initialPreloadSubscription);

  /* retrieve judgement pairs from server if
   * - count of (local) judgement pairs does not fulfill threshold,
   * - the user did not annotate every possible judgement pair,
   * - no judgement pair is currently in status SEND_PENDING, i.e. the annotation of the
   *   judgement pair is currently transferred to the server,
   * - and no judgement pairs are currently retrieved from the server
   */
  let retrieveJudgPairsInflight = false;
  const retrieveJudgPairsSubscription: MemoizedSubscription = {
    memoizeOnValue: (subscribedStore) => subscribedStore.getState().annotation.judgementPairs,
    listener: async (subscribedStore) => {
      const annotationState = subscribedStore.getState().annotation;

      if (annotationComputations.annotationDataReceivedFromServer(subscribedStore.getState())) {
        const countOfOpenJudgementPairs = annotationState.judgementPairs.filter(
          (pair) =>
            pair.status === JudgementPairStatus.TO_JUDGE ||
            pair.status === JudgementPairStatus.SEND_PENDING,
        ).length;
        const countOfPendingJudgementPairs = annotationState.judgementPairs.filter(
          (pair) => pair.status === JudgementPairStatus.SEND_PENDING,
        ).length;
        const countOfNotPreloadedPairs = annotationState.countOfNotPreloadedPairs!;
        if (
          countOfOpenJudgementPairs <= PRELOAD_JUDGEMENTS_THRESHOLD &&
          countOfNotPreloadedPairs > 0 &&
          countOfPendingJudgementPairs === 0 &&
          !retrieveJudgPairsInflight
        ) {
          try {
            retrieveJudgPairsInflight = true;
            logger.info(
              'count of preloaded judgement pairs does not fulfill threshold and ' +
                'there are remaining judgements to preload on the server --> execute preload...',
            );
            await judgementStories.preloadJudgements();
          } finally {
            retrieveJudgPairsInflight = false;
          }
        }
      }
    },
  };
  addMemoizedSubscription(store, retrieveJudgPairsSubscription);
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
