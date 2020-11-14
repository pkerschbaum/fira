import { css } from '@emotion/core';
import { Theme } from '@material-ui/core/styles';

export const commonStyles = {
  grid: {
    entireRow: css({
      gridColumn: '1 / -1',
    }),

    entireRowExceptLastColumn: css({
      gridColumn: '1 / -2',
    }),

    stickToStart: css({
      justifySelf: 'start',
    }),

    stickToEnd: css({
      justifySelf: 'end',
    }),

    horizontalCenter: css({
      justifySelf: 'center',
    }),

    verticalCenter: css({
      alignSelf: 'center',
    }),
  },

  flex: {
    shrinkAndFit: css({
      minWidth: 0,
      flexBasis: 0,
      flexShrink: 1,
      flexGrow: 1,
    }),

    shrinkContainer: css({
      width: 'min-content',
    }),
  },

  text: {
    stickToStart: css({
      textAlign: 'start',
    }),

    stickToEnd: css({
      textAlign: 'end',
    }),

    colorPrimary: (theme: Theme) =>
      css({
        color: theme.palette.text.primary,
      }),

    noTransform: css`
      text-transform: none;
    `,

    overflowEllipsis: css`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `,
  },

  fullHeight: css({
    height: '100%',
  }),

  fullWidth: css({
    width: '100%',
  }),

  maxContainerHeight: css({
    maxHeight: '100%',
  }),

  maxContainerWidth: css({
    maxWidth: '100%',
  }),

  horizontalCenter: css({
    justifySelf: 'center',
    textAlign: 'center',
  }),

  uppercase: css({
    textTransform: 'uppercase',
  }),

  preserveNewlines: css({
    whiteSpace: 'pre-wrap',
  }),

  noNewLines: css({
    whiteSpace: 'nowrap',
  }),

  transparent: css({
    opacity: 0,
  }),

  hidden: css({
    display: 'none',
  }),

  overlayContainer: css({
    display: 'grid',
    justifyItems: 'center',
  }),

  overlayChild: css({
    gridColumn: '1',
    gridRow: '1',
  }),

  transparentBackground: css({
    backgroundColor: 'transparent',
  }),

  cursorPointer: css({
    cursor: 'pointer',
  }),

  noUserSelectionAllowed: css`
    user-select: none;
  `,
};
