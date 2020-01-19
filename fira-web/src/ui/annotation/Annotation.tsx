import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from './Annotation.module.css';
import { RootState, AppDispatch } from '../../store/store';
import { actions as annotationActions } from '../../store/annotation/annotation.slice';
import { RelevanceLevel, RateLevels } from '../../typings/enums';

const Annotation: React.FC = () => {
  const annotationState = useSelector((state: RootState) => state.annotation);
  const dispatch = useDispatch<AppDispatch>();

  const createRatingFn = (relevanceLevel: RelevanceLevel) => () => {
    dispatch(annotationActions.rateJudgementPair({ relevanceLevel }));
  };

  const createAnnotatePartFn = (annotationPartIndex: number) => () => {
    dispatch(annotationActions.selectRangeStartEnd({ annotationPartIndex }));
  };

  const currentJudgementPair = annotationState.judgementPairs.find(
    pair => pair.id === annotationState.currentJudgementPairId,
  );
  if (!currentJudgementPair) {
    return <div>Loading...</div>;
  }

  const currentRateLevel = RateLevels.find(
    rateLevel => rateLevel.relevanceLevel === currentJudgementPair.relevanceLevel,
  );
  const hasToAnnotate =
    currentRateLevel?.annotationRequired && currentJudgementPair.annotatedRanges.length === 0;
  const canAnnotate = currentRateLevel?.annotationRequired;

  return (
    <div>
      <div>{currentJudgementPair.queryText}</div>
      <div>
        {currentJudgementPair.docAnnotationParts.map((annotationPart, i) => {
          // replace blank by fixed-width blank character (otherwise, styles like border don't apply)
          const textToShow = annotationPart !== ' ' ? annotationPart : '\u00a0';

          // set css class if part is start of the current selected range
          const currentRangeStartStyle =
            annotationState.currentAnnotationStart === i ? styles.rangeStart : '';

          // set css class if part is in one of the selected ranges
          const isInRangeStyle = currentJudgementPair.annotatedRanges.some(
            range => range.start <= i && range.end >= i,
          )
            ? styles.isInRange
            : '';

          // display the span as selectable if annotation is possible
          const selectableStyle = canAnnotate ? styles.selectable : '';

          return (
            <span
              key={i}
              onClick={createAnnotatePartFn(i)}
              className={`${styles.annotatePart} ${currentRangeStartStyle} ${isInRangeStyle} ${selectableStyle}`}
            >
              {textToShow}
            </span>
          );
        })}
      </div>
      <div>
        {RateLevels.map(rateButton => (
          <button
            key={rateButton.relevanceLevel}
            onClick={createRatingFn(rateButton.relevanceLevel)}
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
