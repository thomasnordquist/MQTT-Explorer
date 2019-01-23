import * as React from 'react'
import * as q from '../../backend/src/Model'

import { Theme, withStyles } from '@material-ui/core/styles'

import { AppState } from './reducers'
import Connection from './components/ConnectionSetup/Connection'
import CssBaseline from '@material-ui/core/CssBaseline'
const Settings = React.lazy(() => import('./components/Settings'))
import Sidebar from './components/Sidebar/Sidebar'
import TitleBar from './components/TitleBar'
import Tree from './components/Tree/Tree'
import UpdateNotifier from './UpdateNotifier'
import { connect } from 'react-redux'
import ErrorBoundary from './ErrorBoundary'
import { default as SplitPane } from 'react-split-pane'

interface Props {
  name: string
  connectionId: string
  classes: any
  settingsVisible: boolean
}

class App extends React.Component<Props, {}> {
  constructor(props: any) {
    super(props)
    this.state = { }
  }

  public render() {
    const { settingsVisible } = this.props
    const { content, contentShift, centerContent, paneDefaults, heightProperty } = this.props.classes

    return (
      <div className={centerContent}>
        <CssBaseline />
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Settings />
          </React.Suspense>
          <div className={`${settingsVisible ? contentShift : content} ${heightProperty}`}>
              <TitleBar />
              <div className={centerContent}>
              <SplitPane
                step={48}
                primary="second"
                className={heightProperty}
                split="vertical"
                minSize={250}
                defaultSize={500}
                allowResize={true}
                pane1Style={{ overflow: 'hidden' }}
              >
                <div className={paneDefaults}>
                  <Tree />
                </div>
                <div className={paneDefaults}>
                  <Sidebar connectionId={this.props.connectionId} />
                </div>
              </SplitPane>
              </div>
          </div>
          <UpdateNotifier />
          <Connection />
        </ErrorBoundary>
      </div >
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    settingsVisible: state.settings.visible,
    connectionId: state.connection.connectionId,
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
      backgroundColor: theme.palette.background.default,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 0,
    },
    contentShift: {
      padding: 0,
      backgroundColor: theme.palette.background.default,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    },
  }
}

export default withStyles(styles)(connect(mapStateToProps)(App))
