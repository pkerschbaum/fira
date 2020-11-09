import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';
import { Property } from 'csstype';

type StyleParams = {
  direction: 'row' | 'column';
  justifyContent: Property.JustifyContent;
  alignItems: Property.AlignItems;
  wrap?: true | 'nowrap' | 'wrap-reverse';
  growItems?: boolean;
  itemsBasis?: Property.FlexBasis<string | 0>;
  spacing: number;
};

export const styles = {
  stack: (params: StyleParams) => (theme: Theme) => {
    const flexGrow = !!params.growItems ? 1 : undefined;
    const flexBasis = params.itemsBasis !== undefined ? params.itemsBasis : undefined;

    return css({
      display: 'flex',
      flexDirection: params.direction,
      justifyContent: params.justifyContent,
      alignItems: params.alignItems,
      flexWrap: typeof params.wrap === 'string' ? params.wrap : !!params.wrap ? 'wrap' : undefined,

      '& > *': {
        flexGrow,
        flexBasis,
        marginBottom: params.direction !== 'column' ? 0 : theme.spacing(params.spacing),
        marginRight: params.direction !== 'row' ? 0 : theme.spacing(params.spacing),
      },

      '& > *:last-child': {
        marginBottom: 0,
        marginRight: 0,
      },
    });
  },
};
