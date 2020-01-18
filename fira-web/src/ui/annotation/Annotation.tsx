import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { judgementsService } from '../../judgements/judgements.service';
import { RootState, AppDispatch } from '../../store/store';
import { actions as annotationActions } from '../../store/annotation.slice';
import { RelevanceLevel, RateLevels } from '../../typings/enums';

const Annotation: React.FC = () => {
  const annotationState = useSelector((state: RootState) => state.annotation);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (
      annotationState.remainingToFinish === undefined ||
      (annotationState.judgementPairs.length < 2 &&
        annotationState.remainingToFinish > annotationState.judgementPairs.length)
    ) {
      judgementsService.preloadJudgements();
    }
  }, [annotationState.judgementPairs.length, annotationState.remainingToFinish]);

  const createRatingFn = (id: number, relevanceLevel: RelevanceLevel) => () => {
    dispatch(annotationActions.rateJudgementPair({ id, relevanceLevel }));
  };

  const currentJudgement =
    annotationState.judgementPairs.length > 1 && annotationState.judgementPairs[0];

  if (!currentJudgement) {
    return <div>Loading...</div>;
  }

  const currentRateLevel = RateLevels.find(
    rateLevel => rateLevel.relevanceLevel === currentJudgement.relevanceLevel,
  );
  const hasToAnnotate =
    currentRateLevel?.annotationRequired && currentJudgement.annotatedParts.length === 0;

  return (
    <div>
      <div>{currentJudgement.queryText}</div>
      <div>
        {currentJudgement.docAnnotationParts.map((annotationPart, i) => (
          <span key={i}>{annotationPart}</span>
        ))}
      </div>
      <div>
        {RateLevels.map(rateButton => (
          <button
            key={rateButton.relevanceLevel}
            onClick={createRatingFn(currentJudgement.id, rateButton.relevanceLevel)}
          >
            {rateButton.text}
          </button>
        ))}
      </div>
      <div>Remaining to finish: {annotationState.remainingToFinish}</div>
    </div>
  );
};

export default Annotation;
