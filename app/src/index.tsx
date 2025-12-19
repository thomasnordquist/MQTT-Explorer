import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import Demo from './components/Demo'
import reducers, { AppState } from './reducers'
import reduxThunk from 'redux-thunk'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import { connect, Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/styles'
import './utils/tracking'
import { themes } from './theme'
import { BrowserAuthWrapper } from './components/BrowserAuthWrapper'

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(reduxThunk, batchDispatchMiddleware)))

function ApplicationRenderer(props: { theme: 'light' | 'dark' }) {
  return (
    <ThemeProvider theme={props.theme === 'light' ? themes.lightTheme : themes.darkTheme}>
      <App />
      <Demo />
    </ThemeProvider>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    theme: state.settings.get('theme'),
  }
}

const Application = connect(mapStateToProps)(ApplicationRenderer)

ReactDOM.render(
  <Provider store={store}>
    <BrowserAuthWrapper>
      <Application />
    </BrowserAuthWrapper>
  </Provider>,
  document.getElementById('app')
)
