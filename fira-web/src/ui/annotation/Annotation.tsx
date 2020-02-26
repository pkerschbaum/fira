import React, { useState } from 'react';

import styles from './Annotation.module.css';
import { RelevanceLevel, RateLevels } from '../../typings/enums';
import { judgementsService } from '../../judgements/judgements.service';
import { noop } from '../../util/functions';
import Button from '../elements/Button';
import { useKeyupEvent as useKeyupHandler } from '../util/events.hooks';
import RateButton from './RateButton';
import { JudgementPair } from '../../store/annotation/annotation.slice';
import AnnotationPart from './AnnotationPart';

const Annotation: React.FC<{
  currentJudgementPair: JudgementPair;
  remainingToFinish: number;
  alreadyFinished: number;
  selectRangeStartEnd: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
  deleteRange: ({ annotationPartIndex }: { annotationPartIndex: number }) => void;
  rateJudgementPair: ({ relevanceLevel }: { relevanceLevel: RelevanceLevel }) => void;
}> = ({
  currentJudgementPair,
  remainingToFinish,
  alreadyFinished,
  selectRangeStartEnd,
  deleteRange,
  rateJudgementPair,
}) => {
  const [tooltipAnnotatePartIndex, setTooltipAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );

  useKeyupHandler({
    Digit1: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.MISLEADING_ANSWER }),
    Digit2: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.NOT_RELEVANT }),
    Digit3: () =>
      rateJudgementPair({
        relevanceLevel: RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER,
      }),
    Digit4: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.GOOD_ANSWER }),
    Digit5: () => rateJudgementPair({ relevanceLevel: RelevanceLevel.PERFECT_ANSWER }),
  });

  const currentRateLevel = RateLevels.find(
    rateLevel => rateLevel.relevanceLevel === currentJudgementPair.relevanceLevel,
  );
  const rateLevelAllowsAnnotation = !!currentRateLevel?.annotationRequired;
  const hasToAnnotate =
    !currentRateLevel ||
    (currentRateLevel.annotationRequired &&
      (currentJudgementPair.annotatedRanges.length === 0 ||
        currentJudgementPair.currentAnnotationStart !== undefined));

  const annotationTarget = remainingToFinish + alreadyFinished;
  const finishedFraction = (alreadyFinished / annotationTarget) * 100;

  function hideTooltip() {
    setTooltipAnnotatePartIndex(undefined);
  }

  return (
    <>
      {finishedFraction !== undefined && (
        <div style={{ width: `${finishedFraction}%` }} className={styles.progressBar} />
      )}
      <div className={styles.container} onClickCapture={hideTooltip}>
        <div className={styles.queryText}>{currentJudgementPair.queryText}</div>
        <div key={currentJudgementPair.id} className={styles.annotationArea}>
          {currentJudgementPair.docAnnotationParts.map((annotationPart, i) => {
            // determine if part is in one of the selected ranges
            const isInSelectedRange = currentJudgementPair.annotatedRanges.some(
              range => range.start <= i && range.end >= i,
            );

            const canAnnotatePart = rateLevelAllowsAnnotation && !isInSelectedRange;

            return (
              <AnnotationPart
                key={i}
                text={annotationPart}
                isRangeStart={currentJudgementPair.currentAnnotationStart === i}
                isInSelectedRange={isInSelectedRange}
                showTooltip={tooltipAnnotatePartIndex === i}
                rateLevelAllowsAnnotation={rateLevelAllowsAnnotation}
                onPartClick={
                  canAnnotatePart
                    ? () => selectRangeStartEnd({ annotationPartIndex: i })
                    : isInSelectedRange
                    ? () => setTooltipAnnotatePartIndex(i)
                    : noop
                }
                onTooltipClick={() => {
                  deleteRange({ annotationPartIndex: i });
                  hideTooltip();
                }}
              />
            );
          })}
        </div>
        <div className={styles.buttonContainer}>
          {RateLevels.map(rateButton => (
            <RateButton
              key={rateButton.relevanceLevel}
              rateLevel={rateButton}
              onClick={() => rateJudgementPair({ relevanceLevel: rateButton.relevanceLevel })}
            />
          ))}
        </div>
        <div>
          <Button
            buttonStyle="bold"
            disabled={hasToAnnotate}
            onClick={() => judgementsService.submitCurrentJudgement()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default Annotation;
