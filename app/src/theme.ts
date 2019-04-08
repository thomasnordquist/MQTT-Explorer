import { createMuiTheme } from "@material-ui/core";
import { amber } from "@material-ui/core/colors";

const baseTheme = {
  typography: {
    body1: {
      fontSize: '0.9rem',
    },
  },
}

const lightTheme = createMuiTheme({
  ...baseTheme,
  palette: {
    type: 'dark',
  },
})

const darkTheme = createMuiTheme({
  ...baseTheme,
  palette: {
    type: 'light',
    background: {
      default: '#fafafa',
    },
    primary: {
      main: '#931e2e',
    },
    secondary: amber,
    action: {
      disabledBackground: '#fafafa',
    },
  },
})

export const themes = {
  lightTheme,
  darkTheme,
}
