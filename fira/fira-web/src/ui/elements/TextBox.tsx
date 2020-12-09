import React from 'react';
import { Box, BoxProps } from '@material-ui/core';

import { assertUnreachable } from '@fira-commons';

import { styles } from './TextBox.styles';
import { commonStyles } from '../Common.styles';

// adapted from https://github.com/mui-org/material-ui/blob/next/packages/material-ui/src/Typography/Typography.js
const TextBox = React.forwardRef<
  HTMLElement,
  {
    component?: 'div' | 'span';
    bold?: boolean;
    italic?: boolean;
    fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
    color?: 'success.900' | 'error.900' | 'error.main';
    textDecoration?: 'line-through';
    textAlign?: 'start' | 'center';
    disablePreserveNewlines?: boolean;
    className?: string;
    children?: React.ReactNode;
    boxProps?: BoxProps;
  }
>((props, ref) => {
  const {
    component = 'div',
    bold = false,
    italic = false,
    textDecoration,
    fontSize = 'md',
    color,
    textAlign,
    disablePreserveNewlines,

    className,
    children,
    boxProps,
  } = props;

  return (
    <Box
      className={className}
      css={(theme) => [
        styles.textBox(theme),
        fontSize === 'sm'
          ? styles.textBox_sm(theme)
          : fontSize === 'xs'
          ? styles.textBox_xs
          : fontSize === 'lg'
          ? styles.textBox_lg
          : fontSize === 'xl'
          ? styles.textBox_xl
          : fontSize === 'xxl'
          ? styles.textBox_xxl
          : fontSize === 'xxxl'
          ? styles.textBox_xxxl
          : fontSize === 'md'
          ? undefined
          : assertUnreachable(fontSize),
        bold && styles.textBox_bold,
        !disablePreserveNewlines && commonStyles.preserveNewlines,
        textDecoration && styles.textDecoration(textDecoration),
      ]}
      sx={{
        fontStyle: italic ? 'italic' : undefined,
        color,
        textAlign,
      }}
      component={component}
      children={children}
      /* add ref, see https://github.com/mui-org/material-ui/issues/17010#issuecomment-615577360 */
      {...({ ref } as any)}
      {...boxProps}
    />
  );
});

export default TextBox;
