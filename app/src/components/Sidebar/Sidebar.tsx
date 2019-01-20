import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Fade,
  Paper,
  Popper,
  Typography,
} from '@material-ui/core'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'

import { AppState } from '../../reducers'
import Copy from '../Copy'
import DateFormatter from '../DateFormatter'
import ExpandMore from '@material-ui/icons/ExpandMore'
import MessageHistory from './MessageHistory'
import NodeStats from './NodeStats'
import Publish from './Publish/Publish'
import Topic from './Topic'
import ValueRenderer from './ValueRenderer'
import { connect } from 'react-redux'

const throttle = require('lodash.throttle')

interface Props {
  node?: q.TreeNode,
  classes: any,
  theme: Theme,
  connectionId?: string,
}

interface State {
  node: q.TreeNode,
  compareMessage?: q.Message
}

class Sidebar extends React.Component<Props, State> {
  private valueRef: any = React.createRef<HTMLDivElement>()
  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)

  constructor(props: any) {
    super(props)
    console.error('Find and fix me #state')
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

    if (this.props.node !== nextProps.node) {
      this.setState({ compareMessage: undefined })
    }
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
    return (
      <div className={this.props.classes.drawer}>
        {this.renderNode()}
      </div>
    )
  }

  private detailsStyle = { padding: '0px 16px 8px 8px', display: 'block' }

  private renderNode() {
    const { classes, node } = this.props

    const copyTopic = node ? <Copy value={node.path()} /> : null
    const copyValue = node && node.message ? <Copy value={node.message.value} /> : null
    const summeryStyle = { minHeight: '0' }
    return (
      <div>
        <ExpansionPanel key="topic" defaultExpanded={true} disabled={!Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Topic {copyTopic}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <Topic node={this.props.node} didSelectNode={this.updateNode} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel key="value" defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Value {copyValue}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            {this.messageMetaInfo()}
            <div ref={this.valueRef}>
              <ValueRenderer message={this.props.node && this.props.node.message} />
            </div>
            <div><MessageHistory onSelect={this.handleMessageHistorySelect} node={this.props.node} /></div>
            <Popper open={Boolean(this.state.compareMessage)} anchorEl={this.valueRef.current} placement="left" transition={true}>
              {this.showValueComparison}
            </Popper>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Publish</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <Publish node={this.props.node} connectionId={this.props.connectionId} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Stats</Typography>
          </ExpansionPanelSummary>
          {this.renderNodeStats()}
        </ExpansionPanel>
      </div>
    )
  }

  private showValueComparison = (a: any) => (
    <Fade {...a.TransitionProps} timeout={350}>
      <Paper>
        <ValueRenderer message={this.state.compareMessage} />
      </Paper>
    </Fade>
  )

  private messageMetaInfo() {
    if (!this.props.node || !this.props.node.message || !this.props.node.mqttMessage) {
      return null
    }

    return (
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ flex: 1 }}><Typography>QoS: {this.props.node.mqttMessage.qos}</Typography></div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <Typography style={{ color: this.props.theme.palette.secondary.main }}><b>{this.props.node.mqttMessage.retain ? 'retained' : null}</b></Typography>
        </div>
        <div style={{ flex: 1, textAlign: 'right' }}><Typography><i><DateFormatter date={this.props.node.message.received} /></i></Typography></div>
      </div>
    )
  }

  private handleMessageHistorySelect = (message: q.Message) => {
    if (message !== this.state.compareMessage) {
      this.setState({ compareMessage: message })
    } else {
      this.setState({ compareMessage: undefined })
    }
  }

  private renderNodeStats() {
    if (!this.props.node) {
      return null
    }

    return (
      <ExpansionPanelDetails style={this.detailsStyle}>
        <NodeStats node={this.props.node} />
      </ExpansionPanelDetails>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    node: state.tooBigReducer.selectedTopic,
  }
}

export default withStyles(Sidebar.styles, { withTheme: true })(connect(mapStateToProps)(Sidebar))
