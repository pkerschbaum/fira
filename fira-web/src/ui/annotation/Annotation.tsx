import React, { useState } from 'react';

import styles from './Annotation.module.css';
import { RelevanceLevel, RateLevels, JudgementMode } from '../../typings/enums';
import { judgementsService } from '../../judgements/judgements.service';
import { noop } from '../../util/functions';
import Button from '../elements/Button';
import { useKeyupEvent as useKeyupHandler } from '../util/events.hooks';
import RateButton from './RateButton';
import { JudgementPair } from '../../store/annotation/annotation.slice';
import AnnotationPart from './AnnotationPart';
import Menu from '../elements/Menu';

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
  const annotationIsAllowed =
    currentJudgementPair.mode !== JudgementMode.PLAIN_RELEVANCE_SCORING &&
    !!currentRateLevel?.annotationRequired;

  /*
   * the annotation is finished only if the user rated the judgement pair (i.e., selected a rate level)
   * and
   * - either the judgement pair requires no annotation (because the judgement mode returned by the server
   *   is not "SCORING_AND_SELECT_SPANS", or the rate level does not require annotation)
   * - or the user annotated at least one section of the paragraph and is not currently in the process of
   *   annotating the next section
   */
  const annotationFinished =
    currentRateLevel &&
    (currentJudgementPair.mode === JudgementMode.PLAIN_RELEVANCE_SCORING ||
      !currentRateLevel.annotationRequired ||
      (currentJudgementPair.annotatedRanges.length > 0 &&
        currentJudgementPair.currentAnnotationStart === undefined));

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
        <div className={styles.topBar}>
          <div className={styles.queryText}>{currentJudgementPair.queryText}</div>
          <Menu />
        </div>
        <div className={styles.horizontalLine} />
        <div key={currentJudgementPair.id} className={styles.annotationArea}>
          {currentJudgementPair.docAnnotationParts.map((annotationPart, i) => {
            // determine if part is in one of the selected ranges
            const isInSelectedRange = currentJudgementPair.annotatedRanges.some(
              range => range.start <= i && range.end >= i,
            );

            const canAnnotatePart = annotationIsAllowed && !isInSelectedRange;

            return (
              <AnnotationPart
                key={i}
                text={annotationPart}
                isRangeStart={currentJudgementPair.currentAnnotationStart === i}
                isInSelectedRange={isInSelectedRange}
                showTooltip={tooltipAnnotatePartIndex === i}
                annotationIsAllowed={annotationIsAllowed}
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
            buttonType="primary"
            disabled={!annotationFinished}
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
