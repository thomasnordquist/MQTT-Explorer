import './tracking'

import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import reducers, { AppState, NodeOrder } from './reducers'

import App from './App'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

const initialAppState: AppState = {
  settings: {
    autoExpandLimit: 0,
    nodeOrder: NodeOrder.none,
    visible: false,
  },
  sidebar: {},
  selectedTopic: undefined,
}
const store = createStore(reducers, initialAppState)

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
  typography: { useNextVariants: true },
})

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <App name="" />
      </Provider>
    </MuiThemeProvider>,
    document.getElementById('app'),
)
