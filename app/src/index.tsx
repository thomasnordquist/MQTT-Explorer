import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import Demo from './components/demo'
import reducers from './reducers'
import reduxThunk from 'redux-thunk'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import './tracking'




const composeEnhancers = /*(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || */ compose
const store = createStore(
  reducers,
  composeEnhancers(
    applyMiddleware(
      reduxThunk,
      batchDispatchMiddleware,
    ),
  ),
)

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
})

setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.style.animation = 'unsplash 0.5s ease-in 0s 1 normal forwards'
    setTimeout(() => splash.remove(), 600)
  }
}, 300)

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <App />
        <Demo />
      </Provider>
    </MuiThemeProvider>,
    document.getElementById('app'),
)
