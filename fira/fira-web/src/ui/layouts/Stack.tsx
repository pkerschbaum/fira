import React from 'react';
import { Box } from '@material-ui/core';
import { Property } from 'csstype';

import { styles } from './Stack.styles';
import { commonStyles } from '../Common.styles';

type StackProps = {
  direction?: 'row' | 'column';
  disableContainerStretch?: boolean;
  justifyContent?: Property.JustifyContent;
  alignItems?: Property.AlignItems;
  wrap?: true | 'nowrap' | 'wrap-reverse';
  growItems?: boolean;
  itemsBasis?: Property.FlexBasis<string | 0>;
  spacing?: number;
  children: React.ReactNode;
};

const Stack = React.forwardRef<HTMLElement, StackProps>(
  (
    {
      direction = 'column',
      disableContainerStretch = false,
      justifyContent,
      alignItems,
      wrap,
      growItems,
      itemsBasis,
      spacing,
      children,
      ...rest
    },
    ref,
  ) => {
    const stackStyle = styles.stack({
      direction,
      justifyContent: justifyContent ?? 'flex-start',
      alignItems: alignItems ?? 'center',
      wrap,
      growItems,
      itemsBasis,
      spacing: spacing ?? 1,
    });

    return (
      <Box
        css={(theme) => [
          stackStyle(theme),
          !disableContainerStretch &&
            (direction === 'column' ? commonStyles.fullWidth : commonStyles.fullHeight),
        ]}
        ref={ref}
        /* we spread any additional props onto the box to support the Tooltip component
           see https://material-ui.com/components/tooltips/#custom-child-element 
         */
        {...rest}
      >
        {children}
      </Box>
    );
  },
);

export default Stack;
