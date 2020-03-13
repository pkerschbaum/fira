import React from 'react';
import { Manager, Reference, Popper } from 'react-popper';

import styles from './AnnotationPart.module.css';
import Button from '../../elements/Button';

const AnnotationPart: React.FC<{
  text: string;
  isRangeStart?: boolean;
  isInSelectedRange: boolean;
  showTooltip?: boolean;
  annotationIsAllowedOnPart?: boolean;
  annotationIsAllowedInGeneral: boolean;
  isPlaceholder?: boolean;
  onPartClick: () => void;
  onTooltipClick: () => void;
}> = ({
  text,
  isRangeStart = false,
  isInSelectedRange,
  showTooltip = false,
  annotationIsAllowedOnPart = false,
  annotationIsAllowedInGeneral,
  isPlaceholder = false,
  onPartClick,
  onTooltipClick,
}) => {
  // replace blank by fixed-width blank character (otherwise, styles like border/box-shadow don't apply)
  const textToShow = text.replace(' ', '\u00a0');

  // set css class if part is start of the current selected range
  const currentRangeStartStyle = isRangeStart ? styles.rangeStart : '';

  // highlight the span as selectable (e.g., on hover) if annotation on the part is allowed
  const annotationAllowedOnPartStyle = annotationIsAllowedOnPart
    ? styles.annotationAllowedOnPart
    : '';

  // apply additional styles if annotation is allowed (e.g., spacing for mobile devices)
  const annotationAllowedInGeneralStyle = annotationIsAllowedInGeneral
    ? styles.annotationAllowedInGeneral
    : '';

  const placeholderStyle = isPlaceholder ? styles.placeholder : '';

  const annotatePartSpan = (ref?: any) => (
    <span
      ref={ref}
      onClick={onPartClick}
      className={`${styles.annotatePart} ${currentRangeStartStyle} ${
        !!isInSelectedRange ? styles.isInRange : ''
      } ${annotationAllowedOnPartStyle} ${annotationAllowedInGeneralStyle} ${placeholderStyle}`}
    >
      {textToShow}
    </span>
  );

  return !showTooltip ? (
    annotatePartSpan()
  ) : (
    <Manager>
      <Reference>{({ ref }) => annotatePartSpan(ref)}</Reference>
      <Popper placement="right">
        {({ ref, style, placement }) => (
          <div ref={ref} style={style} data-placement={placement}>
            <Button className={styles.annotatePartTooltipButton} onClick={onTooltipClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="14"
                viewBox="5 3 14 18"
                fill="var(--color-destructive)"
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
};

export default AnnotationPart;
