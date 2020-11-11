import { css } from '@emotion/core';

/* all lines except the last line are stretched (simulates justified layout) */

const lineBase = css`
  display: flex;

  & > span {
    white-space: pre;
  }

  & > span::selection {
    background: var(--color-annotation-allowed-highlight);
  }
`;

export const styles = {
  line: css`
    ${lineBase};
    justify-content: space-between;
    width: 100%;
  `,

  lastLine: css`
    ${lineBase};
    justify-content: flex-start;
  `,

  hiddenPlaceholder: css`
    position: absolute;
    height: 0;
    overflow: hidden;
    white-space: pre;
  `,
};
