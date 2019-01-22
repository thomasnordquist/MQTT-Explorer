import { createReducer } from './lib'
import { createMuiTheme, Theme } from '@material-ui/core'

const initialState: Theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  typography: { useNextVariants: true },
})

export const theme = createReducer(initialState, {})
