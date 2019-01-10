import * as React from 'react'
import { connect } from 'react-redux'
import * as q from '../../backend/src/Model'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles, Theme } from '@material-ui/core/styles'
import Tree from './components/Tree/Tree'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar/Sidebar'
import Connection from './components/ConnectionSetup/Connection'
import Settings from './components/Settings'
import { AppState } from './reducers'

interface State {
  selectedNode?: q.TreeNode,
  connectionId?: string
}

interface Props {
  name: string
  theme: Theme
  settingsVisible: boolean
}

class App extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      selectedNode: undefined,
    }
  }

  private getStyles(): {[s: string]: React.CSSProperties} {
    const { theme } = this.props
    const drawerWidth = 300
    return {
      left: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        height: 'calc(100vh - 64px)',
        float: 'left',
        overflowY: 'scroll',
        overflowX: 'hidden',
        display: 'block',
        width: '60vw',
      },
      right: {
        height: 'calc(100vh - 64px)',
        color: theme.palette.text.primary,
        float: 'left',
        width: '40vw',
        overflowY: 'scroll',
        overflowX: 'hidden',
        display: 'block',
      },
      centerContent: {
        width: '100vw',
        overflow: 'hidden',
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

  public render() {
    const { settingsVisible } = this.props
    const { content, contentShift, centerContent } = this.getStyles()
    return <div style={centerContent}>
      <CssBaseline />
      <Settings />
      <div style={settingsVisible ? contentShift : content}>
          <TitleBar />
          <div style={centerContent}>
            <div style={this.getStyles().left}>
              <Tree connectionId={this.state.connectionId} didSelectNode={(node: q.TreeNode) => {
                this.setState({ selectedNode: node })
              }} />
            </div>
            <div style={this.getStyles().right}>
              <Sidebar />
            </div>
          </div>
      </div>
      <Connection onConnection={(connectionId: string) => this.setState({ connectionId })}/>
    </div >
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    settingsVisible: state.settings.visible,
  }
}

export default withStyles({}, { withTheme: true })(connect(mapStateToProps)(App))
