import { createLogger } from '../../logger/logger';
import { RootStore } from '../store';
import { judgementsService } from '../../judgements/judgements.service';

const logger = createLogger('annotation.subscriptions');

export const setupSubscriptions = (store: RootStore) => {
  // listen for changes on annotation state

  store.subscribe(() => {
    const annotationState = store.getState().annotation;
    if (
      annotationState.remainingToFinish === undefined ||
      (annotationState.judgementPairs.length < 2 &&
        annotationState.remainingToFinish > annotationState.judgementPairs.length)
    ) {
      logger.info(
        'count of preloaded judgement pairs does not fulfill threshold and ' +
          'there are remaining judgements to preload on the server --> execute preload...',
      );
      judgementsService.preloadJudgements();
    }
  });
};
