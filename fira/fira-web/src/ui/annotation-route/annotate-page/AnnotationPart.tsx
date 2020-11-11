import React, { useRef } from 'react';
import { Box, Popover } from '@material-ui/core';

import Button from '../../elements/Button';
import TextBox from '../../elements/TextBox';

import { styles } from './AnnotationPart.styles';

const WHITESPACE = ' ';

const AnnotationPart: React.FC<{
  idx: string;
  text: string;
  isRangeStart?: boolean;
  isInSelectedRange: boolean;
  showPopover?: boolean;
  annotationIsAllowedOnPart?: boolean;
  annotationIsAllowedInGeneral: boolean;
  onPartClick: () => void;
  onPopoverClick: () => void;
}> = ({
  idx,
  text,
  isRangeStart = false,
  isInSelectedRange,
  showPopover = false,
  annotationIsAllowedOnPart = false,
  annotationIsAllowedInGeneral,
  onPartClick,
  onPopoverClick,
}) => {
  const popoverAnchorRef = useRef<HTMLSpanElement>(null);

  // set css class if part is start of the current selected range
  const currentRangeStartStyle = isRangeStart ? styles.rangeStart : false;

  // highlight the span as selectable (e.g., on hover) if annotation on the part is allowed
  const annotationAllowedOnPartStyle = annotationIsAllowedOnPart
    ? styles.annotationAllowedOnPart
    : false;

  // apply additional styles if annotation is allowed (e.g., spacing for mobile devices)
  const annotationAllowedInGeneralStyle = annotationIsAllowedInGeneral
    ? styles.annotationAllowedInGeneral
    : false;

  const whitespaceStyle = text === WHITESPACE ? styles.whitespace : false;

  return (
    <>
      <span
        ref={popoverAnchorRef}
        data-idx={idx}
        onClick={onPartClick}
        css={[
          styles.annotatePart,
          currentRangeStartStyle,
          !!isInSelectedRange ? styles.isInRange : false,
          !currentRangeStartStyle && !isInSelectedRange && annotationAllowedOnPartStyle,
          annotationAllowedInGeneralStyle,
          whitespaceStyle,
        ]}
      >
        {text}
      </span>

      {popoverAnchorRef.current !== null && (
        <Popover
          open={showPopover}
          anchorEl={popoverAnchorRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box css={styles.annotatePartPopover}>
            <Button variant="outlined" onClick={onPopoverClick}>
              <svg
                css={styles.annotatePartPopoverIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="15"
                viewBox="5 3 14 18"
                fill="var(--color-destructive)"
              >
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
              <TextBox component="span" fontSize="sm">
                Remove
              </TextBox>
            </Button>
          </Box>
        </Popover>
      )}
    </>
  );
};

export default AnnotationPart;
