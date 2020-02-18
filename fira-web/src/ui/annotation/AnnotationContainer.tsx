import React from 'react';

import Annotation from './Annotation';
import { useAnnotationState, useAnnotationActions } from '../../store/annotation/annotation.hooks';

const AnnotationContainer: React.FC = () => {
  const { remainingToFinish, alreadyFinished, currentJudgementPair } = useAnnotationState();
  const { selectRangeStartEnd, deleteRange, rateJudgementPair } = useAnnotationActions();

  /*
   * - if we know that no annotations must be finished anymore
   *   --> render finished screen
   * - if we don't know how many annotations must be finished,
   *   or if we currently have no judgement pair to show
   *   --> render loading screen
   * - else, i.e. if we know that at least one judgement must be finished
   *   and we have a judgement pair to show
   *   --> render annotation screen
   */

  if (remainingToFinish !== undefined && remainingToFinish <= 0) {
    return (
      // TODO implement finished screen
      <div>Finished!</div>
    );
  }

  return remainingToFinish === undefined || !currentJudgementPair ? (
    // TODO implement loading screen
    <div>Loading...</div>
  ) : (
    <Annotation
      currentJudgementPair={currentJudgementPair}
      remainingToFinish={remainingToFinish}
      alreadyFinished={alreadyFinished ?? 0}
      selectRangeStartEnd={selectRangeStartEnd}
      deleteRange={deleteRange}
      rateJudgementPair={rateJudgementPair}
    />
  );
};

export default AnnotationContainer;
