import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import Copy from '../Copy'
import CustomIconButton from '../CustomIconButton'
import Delete from '@material-ui/icons/Delete'
import ExpandMore from '@material-ui/icons/ExpandMore'
import NodeStats from './NodeStats'
import Topic from './Topic'
import ValueRendererPanel from './ValueRenderer/Panel'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions, sidebarActions } from '../../actions'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../TopicViewModel'

import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Tooltip,
  Badge,
} from '@material-ui/core'

const throttle = require('lodash.throttle')

const Publish = React.lazy(() => import('./Publish/Publish'))

interface Props {
  node?: q.TreeNode<TopicViewModel>
  actions: typeof sidebarActions
  settingsActions: typeof settingsActions
  classes: any
  connectionId?: string
}

interface State {
  node: q.TreeNode<TopicViewModel>
  compareMessage?: q.Message
  valueRenderWidth: number
}

class Sidebar extends React.Component<Props, State> {
  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)

  constructor(props: any) {
    super(props)
    console.error('Find and fix me #state')
    this.state = { node: new q.Tree(), valueRenderWidth: 300 }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.removeUpdateListener(this.props.node)
    nextProps.node && this.registerUpdateListener(nextProps.node)
    this.props.node && this.setState({ node: this.props.node })

    if (this.props.node !== nextProps.node) {
      this.setState({ compareMessage: undefined })
    }
  }

  public componentWillUnmount() {
    this.props.node && this.removeUpdateListener(this.props.node)
  }

  private registerUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.subscribe(this.updateNode)
    node.onMessage.subscribe(this.updateNode)
  }

  private removeUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.unsubscribe(this.updateNode)
    node.onMessage.unsubscribe(this.updateNode)
  }

  public render() {
    return (
      <div id="Sidebar" className={this.props.classes.drawer}>
        {this.renderNode()}
      </div>
    )
  }

  private detailsStyle = { padding: '0px 16px 8px 8px', display: 'block' }

  private renderTopicDeleteButton() {
    if (!this.props.node || (!this.props.node.message || !this.props.node.message.value)) {
      return null
    }

    return (
      <CustomIconButton onClick={() => this.deleteTopic(this.props.node)}>
        <Tooltip title="Clear this topic">
          <Delete />
        </Tooltip>
      </CustomIconButton>
    )
  }

  private renderRecursiveTopicDeleteButton() {
    const deleteLimit = 50
    const topicCount = this.props.node ? this.props.node.childTopicCount() : 0
    if ((!this.props.node || topicCount === 0) || (this.props.node.message && topicCount === 1)) {
      return null
    }

    return (
      <CustomIconButton onClick={() => this.deleteTopic(this.props.node, true, deleteLimit)}>
        <Tooltip title={`Deletes up to ${deleteLimit} sub-topics with a single click`}>
          <Badge
            classes={{ badge: this.props.classes.badge }}
            badgeContent={<span style={{ whiteSpace: 'nowrap' }}>{topicCount >= deleteLimit ? '50+' : topicCount}</span>}
            color="secondary"
          >
            <Delete color="action" />
          </Badge>
        </Tooltip>
      </CustomIconButton>
    )
  }

  private deleteTopic = (topic?: q.TreeNode<TopicViewModel>, recursive: boolean = false, maxCount = 50) => {
    if (!topic) {
      return
    }

    this.props.actions.clearTopic(topic, recursive, maxCount)
  }

  private renderNode() {
    const { classes, node } = this.props

    const copyTopic = node ? <Copy value={node.path()} /> : null
    const deleteTopic = this.renderTopicDeleteButton()
    const deleteRecursiveTopic = this.renderRecursiveTopicDeleteButton()
    const summaryStyle = { minHeight: '0' }
    return (
      <div>
        <ExpansionPanel key="topic" defaultExpanded={true} disabled={!Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
            <Typography className={classes.heading}>Topic {copyTopic} {deleteTopic} {deleteRecursiveTopic}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <Topic node={this.props.node} didSelectNode={this.updateNode} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        {<ValuePanel />}
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
            <Typography className={classes.heading}>Publish</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Publish node={this.props.node} connectionId={this.props.connectionId} />
            </React.Suspense>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
            <Typography className={classes.heading}>Stats</Typography>
          </ExpansionPanelSummary>
          {this.renderNodeStats()}
        </ExpansionPanel>
      </div>
    )
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
    node: state.tree.selectedTopic,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }
}

const styles: StyleRulesCallback<string> = (theme: Theme) => {
  return {
    drawer: {
      display: 'block',
      height: '100%',
    },
    valuePaper: {
      margin: theme.spacing(1),
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Sidebar))
