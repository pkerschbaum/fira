import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

export const styles = {
  adminArea: css`
    width: var(--narrow-content-area-width);
  `,

  statisticsArea: (theme: Theme) => css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-start;
    grid-row-gap: ${theme.spacing(2)};
  `,
};
