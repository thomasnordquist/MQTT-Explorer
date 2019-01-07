import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducers, { AppState } from './reducers'
import App from './App'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    type: 'dark', // Switching the dark mode on is a single property value change.
  },
  typography: { useNextVariants: true },
})

declare var document: any
declare var window: any

const initialAppState = {
  settings: {
    autoExpandLimit: 0,
    visible: false,
  },
}

const store = createStore(reducers, initialAppState)
window.reduxStore = store

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <App name="" />
      </Provider>
    </MuiThemeProvider>,
    document.getElementById('example'),
)
