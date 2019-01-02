import * as React from "react";
import * as q from '../../../backend/src/Model'
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { ValueRenderer } from './ValueRenderer'

interface Props {
  node?: q.TreeNode | undefined
}

interface State {
  node?: q.TreeNode | undefined
}

export class Sidebar extends React.Component<Props, State> {
  private updateNode: (node?: q.TreeNode | undefined) => void
  constructor(props: any) {
    super(props);
    this.state = {}
    this.updateNode = (node) => {
      if (!node) {
        this.setState(this.state)
      } else {
        this.setState({node: node})
      }
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.props.node.removeListener('update', this.updateNode)
    nextProps.node && nextProps.node.on('update', this.updateNode)
    nextProps.node && this.updateNode(nextProps.node)
  }

  private open() {
    return this.props.node !== undefined
  }

  public render() {
    return <Drawer open={this.open()} variant="permanent" anchor="right">
      {this.renderNode()}
    </Drawer>
  }

  private renderNode() {
    let style: React.CSSProperties = {display: 'block', width: '40vw'}
    let topicStyle: React.CSSProperties = {width: '100%'}

    if (!this.state.node) {
        return null
    }

    return <div style={style}>
      <TextField style={topicStyle}
          label="Topic"
          value={this.state.node.path()}
          margin="normal"
          variant="outlined"
        />
        <Paper>
          <ValueRenderer node={this.state.node} />
        </Paper>
    </div>
  }
}
