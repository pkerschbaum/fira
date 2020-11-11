import React from 'react';
import { Box, Button as MuiButton, ButtonProps as MuiButtonProps } from '@material-ui/core';

import LoadingIndicator from './LoadingIndicator';

import { commonStyles } from '../Common.styles';

type ButtonProps = MuiButtonProps & {
  isLoading?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, ...props }, ref) => {
    return (
      <MuiButton ref={ref} {...props}>
        {!isLoading ? (
          children
        ) : (
          <Box css={commonStyles.overlayContainer}>
            <Box css={[commonStyles.overlayChild, commonStyles.transparent]}>{children}</Box>
            <LoadingIndicator css={commonStyles.overlayChild} type={'secondary'} />
          </Box>
        )}
      </MuiButton>
    );
  },
);

export default Button;
