import { createMuiTheme } from '@material-ui/core'
import { amber } from '@material-ui/core/colors'

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

const darkTheme = createMuiTheme({
  ...(baseTheme as any),
  palette: {
    type: 'dark',
  },
})

const lightTheme = createMuiTheme({
  ...(baseTheme as any),
  palette: {
    type: 'light',
    background: {
      default: '#fafafa',
    },
    primary: {
      // main: '#931e2e',
      // main: '#172A3A',
      // main: '#004346',
      // main: '#7D4F50',
      // main: '#C14953',
      // main: '#4C4C47',
      // main: '#2D2D2A',
      // main: '#37000A',
      // main: '#56000F',
      // main: '#89023E',
      // main: '#30343F',
      main: '#335C67', // ⭐️
    },
    secondary: amber,
    // secondary: {
    //   main: '#E09F3E',
    // },
    action: {
      disabledBackground: '#fafafa',
    },
  },
})

export const themes = {
  lightTheme,
  darkTheme,
}
