import { css } from '@emotion/core';
import { Theme } from '@material-ui/core';

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
  `,

  actionBarSkeleton: css`
    min-height: 1.5rem;
  `,

  annotationArea: css`
    overflow-x: hidden;
    overflow-y: auto;

    /* add a little bit of vertical padding because otherwise chrome shows the scrollbar, 
     even if it is not necessary... */
    padding: 0.5px 0;

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

  annotationAreaSkeleton: css`
    min-height: 4rem;
  `,

  footer: (theme: Theme) => css`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

    /* the button container does not need any margin because the flex items will 
       get margins, and thus make the container bigger anyways */
    margin: 0;

    & > * {
      margin: ${theme.spacing(0.5)};
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
