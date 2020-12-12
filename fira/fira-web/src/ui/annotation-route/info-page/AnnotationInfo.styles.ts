import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

export const styles = {
  container: (theme: Theme) => css`
    padding-top: ${theme.spacing()};
  `,

  infoImage: css`
    margin: 10px auto;
    width: 90%;
    box-shadow: 0px 0px 5px 1px #a5a5a5;
  `,

  button: css`
    flex-shrink: 0;
  `,
};
