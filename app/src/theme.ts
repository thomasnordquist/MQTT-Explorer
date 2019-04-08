import { createMuiTheme } from "@material-ui/core";
import { amber } from "@material-ui/core/colors";

const baseTheme = {
  typography: {
    allVariants: {
      userSelect: 'none',
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
}

const lightTheme = createMuiTheme({
  ...(baseTheme as any),
  palette: {
    type: 'dark',
  },
})

const darkTheme = createMuiTheme({
  ...(baseTheme as any),
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
