import * as React from 'react'
import * as q from '../../../../backend/src/Model'
// import Drawer from '@material-ui/core/Drawer'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ValueRenderer from './ValueRenderer'
import NodeStats from './NodeStats'
import Topic from './Topic'
import { Typography } from '@material-ui/core'
import { withStyles, Theme, StyleRulesCallback } from '@material-ui/core/styles'
import Copy from '../Copy'

interface Props {
  node?: q.TreeNode | undefined,
  classes: any,
  theme: Theme
}

interface State {
  node?: q.TreeNode | undefined
}

class Sidebar extends React.Component<Props, State> {
  private updateNode = () => {
    this.setState(this.state)
  }

  constructor(props: any) {
    super(props)
    this.state = { node: new q.Tree() }
  }

  public static styles: StyleRulesCallback<string> = (theme: Theme) => {
    return {
      drawer: {
        display: 'block',
        height: '100%',
      },
      valuePaper: {
        margin: `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit}px`,
      },
      heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
      },
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.removeUpdateListener(this.props.node)
    nextProps.node && this.registerUpdateListener(nextProps.node)
    this.props.node && this.setState({ node: this.props.node })
  }

  private registerUpdateListener(node: q.TreeNode) {
    node.onMerge.subscribe(this.updateNode)
    node.onMessage.subscribe(this.updateNode)
  }

  private removeUpdateListener(node: q.TreeNode) {
    node.onMerge.unsubscribe(this.updateNode)
    node.onMessage.unsubscribe(this.updateNode)
  }

  public render() {
    return <div className={this.props.classes.drawer}>
      {this.renderNode()}
    </div>
  }

  private renderNode() {
    const { classes, node } = this.props

    const copyTopic = node ? <Copy value={node.path()} /> : null
    const copyValue = node && node.message ? <Copy value={node.message.value} /> : null

    return <div>
      <ExpansionPanel key="topic" defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <Typography className={classes.heading}>Topic {copyTopic}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Topic node={this.props.node} didSelectNode={this.updateNode} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel key="value" defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <Typography className={classes.heading}>Value {copyValue}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <ValueRenderer node={this.state.node} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel defaultExpanded={true}>
        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
          <Typography className={classes.heading}>Stats</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <NodeStats node={this.state.node} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  }
}

export default withStyles(Sidebar.styles, { withTheme: true })(Sidebar)
