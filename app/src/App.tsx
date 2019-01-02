import * as React from 'react'
import * as q from '../../backend/src/Model'

import { Tree } from './components/Tree'
import TitleBar from './components/TitleBar'
import { Sidebar } from './components/Sidebar'

import { withTheme, Theme } from '@material-ui/core/styles'

class State {
  public selectedNode?: q.TreeNode | undefined
}

interface Props {
  theme: Theme
}

class App extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      selectedNode: undefined,
    }

    console.log('asd', this.props)
    this.theme = this.props.theme
    this.styles = {
      primaryText: {
        backgroundColor: this.theme.palette.background.default,
        padding: `${this.theme.spacing.unit}px ${this.theme.spacing.unit * 2}px`,
        color: this.theme.palette.text.primary,
      },
      primaryColor: {
        backgroundColor: this.theme.palette.background.default,
        // padding: `${this.theme.spacing.unit}px ${this.theme.spacing.unit * 2}px`,
        color: this.theme.palette.common.white,
      },
    }
  }

  private theme: Theme
  private styles: any

  public render() {
    return <div style={this.styles.primaryColor}>
      <TitleBar />
      <Tree didSelectNode={(node: q.TreeNode) => {
        this.setState({ selectedNode: node })
        console.log('did select', node)
      }} />
    </div>
  }
}

export default withTheme()(App)
