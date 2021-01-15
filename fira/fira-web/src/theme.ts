import {
  // https://github.com/mui-org/material-ui/issues/13394
  unstable_createMuiStrictModeTheme as createMuiTheme,
  ThemeOptions,
} from '@material-ui/core/styles';
import { Localization } from '@material-ui/core/locale';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    dimensions: {
      borderWidth: (factor?: number) => number;
    };
  }
  // allow configuration using `createMuiTheme`
  interface ThemeOptions {
    dimensions: {
      borderWidth: (factor?: number) => number;
    };
  }
}

export const createTheme = (locale: Localization) => {
  const defaultTheme = createMuiTheme(undefined, locale);

  const primaryColor = '#202932';

  const theme: ThemeOptions = {
    components: {
      MuiDivider: {
        styleOverrides: {
          root: { backgroundColor: 'rgba(0, 0, 0, 0.25)' },
        },
      },

      MuiTooltip: {
        defaultProps: {
          disableInteractive: true,
        },

        styleOverrides: {
          tooltip: {
            backgroundColor: defaultTheme.palette.common.black,
            boxShadow: defaultTheme.shadows[1],
            fontSize: 11,
          },

          arrow: {
            color: defaultTheme.palette.common.black,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            color: primaryColor,
            padding: 4,
          },
        },
      },
    },

    dimensions: {
      borderWidth: (factor?: number) => (factor === undefined ? 2 : factor * 2),
    },

    palette: { primary: { main: primaryColor } },
  };

  return createMuiTheme(theme, locale);
};
