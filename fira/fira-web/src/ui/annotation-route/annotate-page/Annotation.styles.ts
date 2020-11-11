import { css } from '@emotion/core';
import { Theme } from '@material-ui/core';

/* contains :empty selectors for loading state skeleton animation (see https://css-tricks.com/building-skeleton-screens-css-custom-properties/) */
const emptyStyle = css`
  position: relative;
  overflow: hidden;
  animation: loading 1.5s infinite;
  background-color: rgb(217, 217, 217);
  border-radius: var(--border-radius-xsmall);
`;
const skeletonAnimation = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
  content: '';

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;

export const styles = {
  progressBar: css`
    background-color: var(--color-annotation-progress-bar);
    height: 0.5rem;
    position: absolute;
    top: 0;
    width: calc(var(--finished-fraction) - var(--app-container-padding) * 2);
    /* for desktop layouts, set left value to align progress bar with content */
    left: var(--app-container-padding);

    /* for mobile layouts, stretch progress bar over entire width of screen */
    /* 800px ~ OnePlus 6T, 6.2 inch screen with 19.5:9 ratio */
    @media (max-height: 800px) {
      & {
        left: 0;
        width: var(--finished-fraction);
      }
    }
  `,

  container: css`
    /* 800px ~ OnePlus 6T, 6.2 inch screen with 19.5:9 ratio */
    @media (max-height: 800px) {
      & {
        justify-content: space-between;
      }
    }
  `,

  actionBar: (theme: Theme) => css`
    padding-top: ${theme.spacing()};

    &:empty {
      ${emptyStyle};
      min-height: 1.5rem;
    }

    &:empty::after {
      ${skeletonAnimation};
    }
  `,

  annotationArea: css`
    overflow-x: hidden;
    overflow-y: auto;

    /* add a little bit of vertical padding because otherwise chrome shows the scrollbar, 
     even if it is not necessary... */
    padding: 0.5px 0;

    &:empty {
      ${emptyStyle};
      min-height: 4rem;
    }

    &:empty::after {
      ${skeletonAnimation};
    }

    /* 800px ~ OnePlus 6T, 6.2 inch screen with 19.5:9 ratio */
    @media (max-height: 800px) {
      & {
        flex-grow: 1;
      }
    }

    /* touch devices (primary input is coarse) */
    @media (pointer: coarse) {
      & {
        user-select: none;
      }
    }
  `,

  footer: css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    /* the button container does not need any margin because the flex items will 
       get margins, and thus make the container bigger anyways */
    margin: 0;

    & > * {
      margin: calc(var(--margin-xxsmall) / 2);
    }
  `,

  nextButton: css`
    min-height: 3rem;
  `,

  divider: css`
    border-bottom-width: medium;
    border-color: rgba(0, 0, 0, 0.54);
  `,
};
