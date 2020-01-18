import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { judgementsService } from '../../judgements/judgements.service';
import { RootState } from '../../store/store';

const Annotation: React.FC = () => {
  const annotationState = useSelector((state: RootState) => state.annotation);

  useEffect(() => {
    if (
      annotationState.remainingToFinish === undefined ||
      (annotationState.preloadedJudgements.length < 2 &&
        annotationState.remainingToFinish > annotationState.preloadedJudgements.length)
    ) {
      judgementsService.preloadJudgements();
    }
  }, [annotationState.preloadedJudgements.length, annotationState.remainingToFinish]);

  return (
    <div>
      <div>
        {annotationState.preloadedJudgements.map(judgement => (
          <div key={judgement.id}>{judgement.id}</div>
        ))}
      </div>
      <div>Remaining to finish: {annotationState.remainingToFinish}</div>
    </div>
  );
};

export default Annotation;
