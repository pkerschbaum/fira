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
            backgroundColor: 'black',
            boxShadow: `0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)`, // theme.shadows[1]
            fontSize: 11,
          },

          arrow: {
            color: 'black',
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          label: {
            color: primaryColor,
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
