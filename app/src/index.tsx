import * as React from 'react'
import * as ReactDOM from 'react-dom'
import amber from '@material-ui/core/colors/amber'
import App from './App'
import Demo from './components/Demo'
import reducers, { AppState } from './reducers'
import reduxThunk from 'redux-thunk'
import teal from '@material-ui/core/colors/teal'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import { connect, Provider } from 'react-redux'
import { createMuiTheme, Theme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import './tracking'


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
        primary: {
          main: '#931e2e',
        },
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
    <ThemeProvider theme={createTheme(props.theme)}>
      <App />
      <Demo />
    </ThemeProvider>
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
