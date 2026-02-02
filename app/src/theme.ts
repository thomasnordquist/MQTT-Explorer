import { createTheme } from '@mui/material/styles'
import { amber } from '@mui/material/colors'

const baseTheme = {
  typography: {
    allVariants: {
      // Removed userSelect: 'none' to allow text selection in components
      // Individual components can still disable selection if needed
    },
    body1: {
      fontSize: '0.9rem',
    },
  },
}

const darkTheme = createTheme({
  ...(baseTheme as any),
  palette: {
    mode: 'dark',
  },
})

const lightTheme = createTheme({
  ...(baseTheme as any),
  palette: {
    mode: 'light',
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
