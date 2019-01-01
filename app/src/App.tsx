import * as React from "react";
import * as q from '../../src/Model'

import { AppBar, Toolbar, Typography, InputBase } from '@material-ui/core';

import { Tree } from "./components/Tree";
import { Sidebar } from "./components/Sidebar";
import { withStyles } from '@material-ui/core/styles';

class State {
  public selectedNode?: q.TreeNode | undefined
}

export class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedNode: undefined
    }
  }

  public render() {
    return <div>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" color="inherit">MQTT-Xplorer</Typography>
        </Toolbar>
        <InputBase />
      </AppBar>
      <Tree didSelectNode={(node: q.TreeNode) => {
        this.setState({selectedNode: node})
        console.log('did select', node)
      }}/>
      // <Sidebar node={this.state.selectedNode} />
    </div>
  }
}
