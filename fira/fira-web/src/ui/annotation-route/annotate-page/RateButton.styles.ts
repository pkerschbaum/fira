import { css } from '@emotion/core';

const hotkey = css`
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
`;

export const styles = {
  container: css`
    width: 5.5rem;

    /* touch devices (primary input is coarse) */
    @media (pointer: coarse) {
      & {
        width: 4.25rem;
      }
    }
  `,

  button: css`
    min-height: 3.25rem;
    width: 100%;
    padding: 0;

    border: var(--border-medium) solid var(--darkened-color);
    border-radius: var(--border-radius-normal);
    color: var(--color-dense);
    background: var(--bg-color);

    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    & > div {
      color: white;
    }

    &:hover {
      background: var(--bg-color);
      filter: brightness(85%);
    }

    /* touch devices (primary input is coarse) */
    @media (pointer: coarse) {
      & {
        min-height: 3rem;
      }
    }
  `,

  hotkey,

  divider: css`
    border-bottom-width: medium;
    border-color: rgba(0, 0, 0, 0.54);
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
  },
};
