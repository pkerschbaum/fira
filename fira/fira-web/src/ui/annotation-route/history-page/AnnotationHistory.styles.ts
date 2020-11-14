import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

export const styles = {
  container: (theme: Theme) => css`
    padding-top: ${theme.spacing()};

    /* 800px ~ OnePlus 6T, 6.2 inch screen with 19.5:9 ratio */
    @media (max-height: 800px) {
      & {
        flex-grow: 1;
      }
    }
  `,

  listSkeleton: css`
    border-radius: var(--border-radius-normal);
  `,

  rateBadge: (theme: Theme) => css`
    box-sizing: border-box;
    padding: ${theme.spacing(1, 1.5)};
  `,
};
