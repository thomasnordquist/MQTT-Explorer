import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import Demo from './components/Demo'
import reducers, { AppState } from './reducers'
import reduxThunk from 'redux-thunk'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import { createMuiTheme, MuiThemeProvider, Theme } from '@material-ui/core/styles'
import { Provider, connect } from 'react-redux'
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

setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) {
    splash.style.animation = 'unsplash 0.5s ease-in 0s 1 normal forwards'
    setTimeout(() => splash.remove(), 600)
  }
}, 300)

function createTheme(type: 'light' | 'dark') {
  if (type === 'dark') {
    return createMuiTheme({
      palette: {
        type: 'dark',
      },
    })
  } else {
    return createMuiTheme({
      palette: {
        type: 'light',
      },
    })
  }
}

function ApplicationRenderer(props: {theme: 'light' | 'dark'}) {
  return (
    <MuiThemeProvider theme={createTheme(props.theme)}>
      <App />
      <Demo />
    </MuiThemeProvider>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    theme: state.settings.theme,
  }
}

const Application = connect(mapStateToProps)(ApplicationRenderer)

ReactDOM.render(
  <Provider store={store}>
    <Application />
  </Provider>,
  document.getElementById('app'),
)
