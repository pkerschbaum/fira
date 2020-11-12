import { css } from '@emotion/core';

export const styles = {
  form: css`
    width: var(--narrow-content-area-width);

    @media (max-width: 520px) {
      & {
        width: 100%;
      }
    }
  `,

  input: css`
    width: 100%;
  `,

  errorList: css`
    margin-top: 0;
    color: var(--color-error);
    list-style-position: inside;
    list-style-type: '🚨';
    padding: 0;

    & > li > span {
      margin: 0;
      padding-left: var(--padding-xxxsmall);
    }
  `,
};
