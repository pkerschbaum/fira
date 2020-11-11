import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

// adapted from https://github.com/mui-org/material-ui/blob/next/packages/material-ui/src/Typography/Typography.js

export const styles = {
  textBox: (theme: Theme) => theme.typography.body1,

  textBox_xs: css({
    fontSize: '0.75rem',
  }),

  textBox_sm: (theme: Theme) => theme.typography.body2,

  textBox_lg: css({
    fontSize: '1.25rem',
  }),

  textBox_xl: css({
    fontSize: '1.5rem',
  }),

  textBox_xxl: css({
    fontSize: '2.125rem',
  }),

  textBox_xxxl: css({
    fontSize: '3.75rem',
  }),

  textBox_bold: css({
    fontWeight: 700,
  }),

  textDecoration: (textDecoration: 'line-through') =>
    css({
      textDecoration,
    }),
};
