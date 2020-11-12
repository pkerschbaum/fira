import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

export const styles = {
  container: (theme: Theme) => css`
    padding-top: ${theme.spacing()};
  `,
};
