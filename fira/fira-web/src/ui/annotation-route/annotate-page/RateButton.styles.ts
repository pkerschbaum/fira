import { css } from '@emotion/core';

export const styles = {
  button: css`
    border-radius: var(--border-radius-normal);
  `,

  badge: css`
    padding: 0;

    border: var(--border-medium) solid var(--darkened-color);
    border-radius: var(--border-radius-normal);
    background: var(--bg-color);

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  hotkey: css`
    color: white;
    background: var(--darkened-color);
    position: absolute;
    top: -2px;
    left: -2px;
    min-width: 1.25rem;
    height: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 0.5rem;
    border-radius: 0.75rem;

    /* touch devices (primary input is coarse) */
    @media (pointer: coarse) {
      & {
        display: none;
      }
    }
  `,

  rateLevelStyles: {
    notRelevant: css`
      --bg-color: var(--color-ratelevel-not-relevant);
      --darkened-color: var(--color-ratelevel-not-relevant-darkened);
    `,

    misleadingAnswer: css`
      --bg-color: var(--color-ratelevel-misleading-answer);
      --darkened-color: var(--color-ratelevel-misleading-answer-darkened);
    `,

    topicRelevantDoesNotAnswer: css`
      --bg-color: var(--color-ratelevel-topic-relevant-does-not-answer);
      --darkened-color: var(--color-ratelevel-topic-relevant-does-not-answer-darkened);
    `,

    goodAnswer: css`
      --bg-color: var(--color-ratelevel-good-answer);
      --darkened-color: var(--color-ratelevel-good-answer-darkened);
    `,

    perfectAnswer: css`
      --bg-color: var(--color-ratelevel-perfect-answer);
      --darkened-color: var(--color-ratelevel-perfect-answer-darkened);
    `,

    loading: css`
      width: 60px;
      --bg-color: var(--color-ratelevel-loading);
      --darkened-color: var(--color-ratelevel-loading-darkened);
    `,
  },
};
