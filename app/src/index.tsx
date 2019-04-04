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
import blue from '@material-ui/core/colors/blue'
import red from '@material-ui/core/colors/red'
import pink from '@material-ui/core/colors/pink'
import orange from '@material-ui/core/colors/orange'
import deepOrange from '@material-ui/core/colors/deepOrange'
import indigo from '@material-ui/core/colors/indigo'
import lime from '@material-ui/core/colors/lime'
import green from '@material-ui/core/colors/green'
import teal from '@material-ui/core/colors/teal'
import amber from '@material-ui/core/colors/amber'

const composeEnhancers = /*(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || */ compose
const store = createStore(
  reducers,
  composeEnhancers(
    applyMiddleware(
      reduxThunk,
      batchDispatchMiddleware
    )
  )
)

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
        background: {
          default: '#fafafa',
        },
        primary: teal,
        secondary: amber,
        // error: red,
        action: {
          disabledBackground: '#fafafa',
        },
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
  document.getElementById('app')
)
