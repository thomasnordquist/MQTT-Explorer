import ConfirmationDialog from './ConfirmationDialog'
import ConnectionSetup from './ConnectionSetup/ConnectionSetup'
import CssBaseline from '@material-ui/core/CssBaseline'
import ErrorBoundary from './ErrorBoundary'
import Notification from './Layout/Notification'
import React from 'react'
import TitleBar from './Layout/TitleBar'
import UpdateNotifier from './UpdateNotifier'
import { AppState } from '../reducers'
import { bindActionCreators } from 'redux'
import { ConfirmationRequest } from '../reducers/Global'
import { connect } from 'react-redux'
import { globalActions, settingsActions } from '../actions'
import { Theme, withStyles } from '@material-ui/core/styles'

const Settings = React.lazy(() => import('./SettingsDrawer/Settings'))
const ContentView = React.lazy(() => import('./Layout/ContentView'))

interface Props {
  connectionId: string
  classes: any
  settingsVisible: boolean
  error?: string
  notification?: string
  actions: typeof globalActions
  settingsActions: typeof settingsActions
  launching: boolean
  confirmationRequests: Array<ConfirmationRequest>
}

class App extends React.PureComponent<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }

  private renderNotification() {
    const message = this.props.error || this.props.notification
    const isError = message === this.props.error
    if (message) {
      // Guard in case someone ever calls showError with an error instead of a string
      const str = typeof message === 'string' ? message : JSON.stringify(message)
      return (
        <Notification
          message={str}
          type={isError ? 'error' : 'notification'}
          onClose={() => {
            isError ? this.props.actions.showError(undefined) : this.props.actions.showNotification(undefined)
          }}
        />
      )
    }

    return null
  }

  public componentDidMount() {
    this.props.settingsActions.loadSettings()
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
          <ConfirmationDialog confirmationRequests={this.props.confirmationRequests} />
          {this.renderNotification()}
          <React.Suspense fallback={<div></div>}>
            <Settings />
          </React.Suspense>
          <div className={centerContent}>
            <div className={`${settingsVisible ? contentShift : content}`}>
              <TitleBar />
            </div>
            <div className={settingsVisible ? contentShift : content}>
              <React.Suspense fallback={<div></div>}>
                <ContentView
                  heightProperty={heightProperty}
                  connectionId={this.props.connectionId}
                  paneDefaults={paneDefaults}
                />
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
  const contentBaseStyle = {
    width: '100vw',
    backgroundColor: theme.palette.background.default,
  }

  return {
    heightProperty: {
      height: '100%', // 'calc(100vh - 64px) !important',
    },
    paneDefaults: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      display: 'block' as 'block',
      height: 'calc(100vh - 64px)',
    },
    centerContent: {
      width: '100vw',
      overflow: 'hidden' as 'hidden',
    },
    content: {
      ...contentBaseStyle,
      transition: theme.transitions.create('transform', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      transform: 'translateX(0px)',
    },
    contentShift: {
      ...contentBaseStyle,
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
    settingsVisible: state.globalState.get('settingsVisible'),
    connectionId: state.connection.connectionId,
    error: state.globalState.get('error'),
    notification: state.globalState.get('notification'),
    highlightTopicUpdates: state.settings.get('highlightTopicUpdates'),
    launching: state.globalState.get('launching'),
    confirmationRequests: state.globalState.get('confirmationRequests'),
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(App))
