import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import reducers, { NodeOrder } from './reducers'
import App from './App'

declare var document: any

const initialAppState = {
  settings: {
    autoExpandLimit: 0,
    nodeOrder: NodeOrder.none,
    visible: false,
  },
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
    document.getElementById('example'),
)
