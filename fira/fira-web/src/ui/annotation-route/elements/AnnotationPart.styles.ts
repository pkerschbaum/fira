import { css } from '@emotion/core';

const rangeStart = css`
  background-color: var(--color-annotation-range-start);
`;

const isInRange = css`
  background-color: var(--color-annotation-is-in-range);
  cursor: pointer;
`;

export const styles = {
  annotatePart: css`
    display: inline-block;
    /* add a little bit of vertical padding to increase line height */
    padding: 1px 0;
    transition: box-shadow 0.2s ease 0s, background-color 0.1s ease 0s, padding 0.3s ease-in-out;
    flex-grow: 0;
  `,

  rangeStart,

  isInRange,

  annotationAllowedHighlight: css`
    background-color: var(--color-annotation-allowed-highlight);
  `,

  annotationAllowedInGeneral: css`
    /* touch devices (primary input is coarse) */
    @media (pointer: coarse) {
      & {
        padding: var(--padding-xxxsmall) 0;
      }
    }
  `,

  annotatePartPopover: css`
    & * {
      color: var(--color-destructive);
      fill: var(--color-destructive);
    }
    background-color: white;
  `,

  annotatePartPopoverIcon: css`
    padding-right: var(--padding-xxxsmall);
  `,

  whitespace: css`
    flex-grow: 1;

    /* touch devices (primary input is coarse), webkit only (Chrome, Safari) */
    @media (pointer: coarse) and (-webkit-min-device-pixel-ratio: 0) {
      & {
        /* chrome has a nasty bug on mobile devices: if the user clicks on the 
           left or right edge of a valid annotation part (i.e., an annotation part 
           which can be annotated, most of the time a word), the click event is executed 
           on the _whitespace_ instead of the _annotation part_. So the target of the click event 
           is simply wrong. Since the click on a whitespace does nothing, there is some 
           kind of "dead zone" on every annotation part, and that's why clicks 
           do not start/end an annotation if the user clicks on the left or right edge 
           of an annotation part (even though it should do that).
           This is fixed by telling chrome that whitespaces cannot be the target of pointer events
        */
        pointer-events: none;
      }
    }
  `,
};
