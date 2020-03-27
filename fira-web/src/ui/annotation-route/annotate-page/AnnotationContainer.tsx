import React from 'react';

import Annotation from './Annotation';
import {
  useAnnotationState,
  useAnnotationActions,
} from '../../../store/annotation/annotation.hooks';

const AnnotationContainer: React.FC = () => {
  const { remainingToFinish, alreadyFinished, currentJudgementPair } = useAnnotationState();
  const { selectRangeStartEnd, deleteRange } = useAnnotationActions();

  /*
   * - if we know that no annotations must be finished anymore
   *   --> render finished page
   * - if we don't know how many annotations must be finished,
   *   or if we currently have no judgement pair to show
   *   --> render loading page
   * - else, i.e. if we know that at least one judgement must be finished
   *   and we have a judgement pair to show
   *   --> render annotation page
   */

  if (remainingToFinish !== undefined && remainingToFinish <= 0) {
    return (
      // TODO implement finished page
      <div>Finished!</div>
    );
  }

  return (
    <Annotation
      currentJudgementPair={currentJudgementPair}
      remainingToFinish={remainingToFinish}
      alreadyFinished={alreadyFinished ?? 0}
      selectRangeStartEnd={selectRangeStartEnd}
      deleteRange={deleteRange}
    />
  );
};

export default AnnotationContainer;
