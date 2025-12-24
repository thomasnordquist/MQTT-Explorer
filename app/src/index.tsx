import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './components/App'
import Demo from './components/Demo'
import reducers, { AppState } from './reducers'
import { thunk as reduxThunk } from 'redux-thunk'
import { applyMiddleware, compose, createStore } from 'redux'
import { batchDispatchMiddleware } from 'redux-batched-actions'
import { connect, Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import './utils/tracking'
import { themes } from './theme'
import { BrowserAuthWrapper } from './components/BrowserAuthWrapper'

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(reduxThunk, batchDispatchMiddleware)))

function ApplicationRenderer(props: { theme: 'light' | 'dark' }) {
  const theme = props.theme === 'light' ? themes.lightTheme : themes.darkTheme
  return (
    <ThemeProvider theme={theme}>
      <LegacyThemeProvider theme={theme}>
        <App />
        <Demo />
      </LegacyThemeProvider>
    </ThemeProvider>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    theme: state.settings.get('theme'),
  }
}

const Application = connect(mapStateToProps)(ApplicationRenderer)

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <Provider store={store}>
    <BrowserAuthWrapper>
      <Application />
    </BrowserAuthWrapper>
  </Provider>
)
