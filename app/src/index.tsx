import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { connect, Provider } from 'react-redux'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { ThemeProvider as LegacyThemeProvider } from '@mui/styles'
import App from './components/App'
import Demo from './components/Demo'
import { AppState } from './reducers'
import './utils/tracking'
import { themes } from './theme'
import { BrowserAuthWrapper } from './components/BrowserAuthWrapper'
import { store } from './store'
import './autoConnectHandler' // Initialize auto-connect handling

function ApplicationRenderer(props: { theme: 'light' | 'dark' }) {
  const theme = props.theme === 'light' ? themes.lightTheme : themes.darkTheme
  return (
    // injectFirst puts emotion's styles before the JSS (@mui/styles) ones, so
    // legacy withStyles/makeStyles rules keep overriding component defaults.
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <LegacyThemeProvider theme={theme}>
          <App />
          <Demo />
        </LegacyThemeProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

const mapStateToProps = (state: AppState) => ({
  theme: state.settings.get('theme'),
})

const Application = connect(mapStateToProps)(ApplicationRenderer)

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <Provider store={store}>
    <BrowserAuthWrapper>
      <Application />
    </BrowserAuthWrapper>
  </Provider>
)
