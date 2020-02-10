import React, { useRef, useLayoutEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Manager, Reference, Popper } from 'react-popper';

import styles from './Annotation.module.css';
import { RootState, AppDispatch } from '../../store/store';
import {
  actions as annotationActions,
  JudgementPairStatus,
} from '../../store/annotation/annotation.slice';
import { RelevanceLevel, RateLevels } from '../../typings/enums';
import { judgementsService } from '../../judgements/judgements.service';
import { noop } from '../../util/functions';
import Button from '../elements/Button';

const Annotation: React.FC = () => {
  const annotationState = useSelector((state: RootState) => state.annotation);
  const dispatch = useDispatch<AppDispatch>();
  const [tooltipAnnotatePartIndex, setTooltipAnnotatePartIndex] = useState<number | undefined>(
    undefined,
  );

  const button1Ref = useRef<HTMLButtonElement>(null);
  const button2Ref = useRef<HTMLButtonElement>(null);
  const button3Ref = useRef<HTMLButtonElement>(null);
  const button4Ref = useRef<HTMLButtonElement>(null);
  const button5Ref = useRef<HTMLButtonElement>(null);

  const digitRefMap = {
    Digit1: button1Ref,
    Digit2: button2Ref,
    Digit3: button3Ref,
    Digit4: button4Ref,
    Digit5: button5Ref,
  } as const;

  const rateButtonRefMap = {
    [RelevanceLevel.MISLEADING_ANSWER]: button1Ref,
    [RelevanceLevel.NOT_RELEVANT]: button2Ref,
    [RelevanceLevel.TOPIC_RELEVANT_DOES_NOT_ANSWER]: button3Ref,
    [RelevanceLevel.GOOD_ANSWER]: button4Ref,
    [RelevanceLevel.PERFECT_ANSWER]: button5Ref,
  } as const;

  useLayoutEffect(() => {
    const keyUpHandler = (e: KeyboardEvent) => {
      const key = e.code;
      if (
        key === 'Digit1' ||
        key === 'Digit2' ||
        key === 'Digit3' ||
        key === 'Digit4' ||
        key === 'Digit5'
      ) {
        digitRefMap[key].current!.click();
      }
    };
    document.addEventListener('keyup', keyUpHandler, { passive: true });
    return () => document.removeEventListener('keyup', keyUpHandler);
  });

  const pairsSuccessfullySent = annotationState.judgementPairs.filter(
    pair => pair.status === JudgementPairStatus.SEND_SUCCESS,
  );
  const remainingToFinish =
    annotationState.remainingToFinish === undefined
      ? undefined
      : annotationState.remainingToFinish - pairsSuccessfullySent.length;
  const alreadyFinished =
    annotationState.alreadyFinished === undefined
      ? undefined
      : annotationState.alreadyFinished + pairsSuccessfullySent.length;

  if (remainingToFinish !== undefined && remainingToFinish <= 0) {
    return <div>Finished!</div>;
  }

  const currentJudgementPair = annotationState.judgementPairs.find(
    pair => pair.id === annotationState.currentJudgementPairId,
  );
  if (!currentJudgementPair) {
    return <div>Loading...</div>;
  }

  const createRatingFn = (relevanceLevel: RelevanceLevel) => () => {
    dispatch(annotationActions.rateJudgementPair({ relevanceLevel }));
  };

  const createAnnotatePartFn = (annotationPartIndex: number) => () => {
    dispatch(annotationActions.selectRangeStartEnd({ annotationPartIndex }));
  };

  const createShowTooltipFn = (annotationPartIndex: number) => () =>
    setTooltipAnnotatePartIndex(annotationPartIndex);

  const submitAnnotation = () => {
    judgementsService.submitCurrentJudgement();
  };

  const currentRateLevel = RateLevels.find(
    rateLevel => rateLevel.relevanceLevel === currentJudgementPair.relevanceLevel,
  );
  const rateLevelAllowsAnnotation = currentRateLevel?.annotationRequired;
  const hasToAnnotate =
    !currentRateLevel ||
    (currentRateLevel.annotationRequired &&
      (currentJudgementPair.annotatedRanges.length === 0 ||
        currentJudgementPair.currentAnnotationStart !== undefined));

  let progressBarWidth: number | undefined;
  if (remainingToFinish !== undefined && alreadyFinished !== undefined) {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const annotationTarget = remainingToFinish + alreadyFinished;
    const finishedFraction = alreadyFinished / annotationTarget;
    progressBarWidth = vw * finishedFraction;
  }

  return (
    <>
      {progressBarWidth !== undefined && (
        <div style={{ width: progressBarWidth }} className={styles.progressBar} />
      )}
      <div
        className={styles.container}
        onClickCapture={() => setTooltipAnnotatePartIndex(undefined)}
      >
        <div className={styles.queryText}>{currentJudgementPair.queryText}</div>
        <div key={currentJudgementPair.id} className={styles.annotationArea}>
          {currentJudgementPair.docAnnotationParts.map((annotationPart, i) => {
            // replace blank by fixed-width blank character (otherwise, styles like border don't apply)
            const textToShow = annotationPart.replace(' ', '\u00a0');

            // set css class if part is start of the current selected range
            const currentRangeStartStyle =
              currentJudgementPair.currentAnnotationStart === i ? styles.rangeStart : '';

            // determine if part is in one of the selected ranges
            const isInSelectedRange = currentJudgementPair.annotatedRanges.some(
              range => range.start <= i && range.end >= i,
            );

            const canAnnotatePart = rateLevelAllowsAnnotation && !isInSelectedRange;

            // display the span as selectable if annotation is possible
            const annotationGridStyle = rateLevelAllowsAnnotation ? styles.gridStyle : '';

            const annotatePartSpan = (ref?: any) => (
              <span
                ref={ref}
                key={i}
                onClick={
                  canAnnotatePart
                    ? createAnnotatePartFn(i)
                    : isInSelectedRange
                    ? createShowTooltipFn(i)
                    : noop
                }
                className={`${styles.annotatePart} ${currentRangeStartStyle} ${
                  !!isInSelectedRange ? styles.isInRange : ''
                } ${annotationGridStyle}`}
              >
                {textToShow}
              </span>
            );

            return tooltipAnnotatePartIndex !== i ? (
              annotatePartSpan()
            ) : (
              <Manager>
                <Reference>{({ ref }) => annotatePartSpan(ref)}</Reference>
                <Popper placement="top">
                  {({ ref, style, placement }) => (
                    <div ref={ref} style={style} data-placement={placement}>
                      <Button
                        className={styles.annotatePartTooltipButton}
                        onClick={e => {
                          dispatch(annotationActions.deleteRange({ annotationPartIndex: i }));
                          setTooltipAnnotatePartIndex(undefined);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="18"
                          viewBox="5 3 14 18"
                          fill="white"
                        >
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                        Remove
                      </Button>
                    </div>
                  )}
                </Popper>
              </Manager>
            );
          })}
        </div>
        <div className={styles.buttonContainer}>
          {RateLevels.map(rateButton => (
            <div key={rateButton.relevanceLevel}>
              <Button
                style={{
                  background: rateButton.buttonColor,
                }}
                className={styles.rateButton}
                onClick={createRatingFn(rateButton.relevanceLevel)}
                componentRef={rateButtonRefMap[rateButton.relevanceLevel]}
              >
                {rateButton.text}
              </Button>
            </div>
          ))}
        </div>
        <div>
          <Button buttonStyle="bold" disabled={hasToAnnotate} onClick={submitAnnotation}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default Annotation;
