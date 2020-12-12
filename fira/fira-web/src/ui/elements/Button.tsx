import React from 'react';
import { Box, Button as MuiButton, ButtonProps as MuiButtonProps } from '@material-ui/core';

import LoadingIndicator from './LoadingIndicator';

import { commonStyles } from '../Common.styles';

type ButtonProps = MuiButtonProps & {
  isLoading?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading, ...props }, ref) => {
    const disabled = props.disabled ?? isLoading;

    return (
      <MuiButton
        ref={ref}
        {...props}
        disabled={disabled}
        /* On mobile, devices simulate a hover after a click. Material-UI then displays the button
         * with background-color "primary", even if the button is disabled (and thus, the button
         * should be greyed out). See https://github.com/mui-org/material-ui/issues/15000.
         * The following workaround sets the button color to "inherit" if disabled is true, then
         * Material-UI does not set another background color on simulated hovers.
         */
        color={disabled ? 'inherit' : props.color}
      >
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
