import * as React from 'react'
import ConnectionSetup from './components/ConnectionSetup/ConnectionSetup'
import CssBaseline from '@material-ui/core/CssBaseline'
import ErrorBoundary from './ErrorBoundary'
import Notification from './components/Notification'
import Sidebar from './components/Sidebar/Sidebar'
import TitleBar from './components/TitleBar'
import Tree from './components/Tree/Tree'
import UpdateNotifier from './UpdateNotifier'
import { AppState } from './reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { default as SplitPane } from 'react-split-pane'
import { globalActions, settingsActions } from './actions'
import { Theme, withStyles } from '@material-ui/core/styles'

const Settings = React.lazy(() => import('./components/Settings'))
const ContentView = React.lazy(() => import('./components/ContentView'))

interface Props {
  connectionId: string
  classes: any
  settingsVisible: boolean
  error?: string
  actions: typeof globalActions
  settingsActions: typeof settingsActions
  launching: boolean
}

class App extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = { }
  }

  public componentDidMount() {
    this.props.settingsActions.loadSettings()
  }

  private renderError() {
    if (this.props.error) {
      const error = typeof this.props.error === 'string' ? this.props.error : JSON.stringify(this.props.error)
      return (
        <Notification
          message={error}
          onClose={() => { this.props.actions.showError(undefined) }}
        />
      )
    }
  }

  public render() {
    const { settingsVisible } = this.props
    const { content, contentShift, centerContent, paneDefaults, heightProperty } = this.props.classes

    if (this.props.launching) {
      return null
    }

    return (
      <div className={centerContent}>
        <CssBaseline />
        <ErrorBoundary>
          {this.renderError()}
          <React.Suspense fallback={<div>Loading...</div>}>
            <Settings />
          </React.Suspense>
          <div className={centerContent}>
            <div className={`${settingsVisible ? contentShift : content}`}>
                <TitleBar />
            </div>
            <div className={settingsVisible ? contentShift : content}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <ContentView heightProperty={heightProperty} connectionId={this.props.connectionId} paneDefaults={paneDefaults} />
              </React.Suspense>
            </div>
          </div>
          <UpdateNotifier />
          <ConnectionSetup />
        </ErrorBoundary>
      </div>
    )
  }
}

const styles = (theme: Theme) => {
  const drawerWidth = 300
  return {
    heightProperty: {
      height: 'calc(100vh - 64px) !important',
    },
    paneDefaults: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      overflowY: 'scroll' as 'scroll',
      overflowX: 'hidden' as 'hidden',
      display: 'block' as 'block',
      height: 'calc(100vh - 64px)',
    },
    centerContent: {
      width: '100vw',
      overflow: 'hidden' as 'hidden',
    },
    content: {
      width: '100vw',
      overflowX: 'hidden' as 'hidden',
      backgroundColor: theme.palette.background.default,
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      transform: 'translateX(0px)',
    },
    contentShift: {
      overflowX: 'hidden' as 'hidden',
      width: '100vw',
      padding: 0,
      backgroundColor: theme.palette.background.default,
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      transform: `translateX(${drawerWidth}px)`,
    },
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(globalActions, dispatch),
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    settingsVisible: state.settings.visible,
    connectionId: state.connection.connectionId,
    error: state.globalState.error,
    highlightTopicUpdates: state.settings.highlightTopicUpdates,
    launching: state.globalState.launching,
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(App))
