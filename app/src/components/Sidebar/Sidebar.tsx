import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import Copy from '../helper/Copy'
import CustomIconButton from '../helper/CustomIconButton'
import Delete from '@material-ui/icons/Delete'
import ExpandMore from '@material-ui/icons/ExpandMore'
import NodeStats from './NodeStats'
import Topic from './Topic'
import ValuePanel from './ValueRenderer/ValuePanel'
import { AppState } from '../../reducers'
import { Badge, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { settingsActions, sidebarActions } from '../../actions'
import { Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../model/TopicViewModel'

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
  compareMessage?: q.Message
  valueRenderWidth: number
}

class Sidebar extends React.Component<Props, State> {
  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)

  private detailsStyle = { padding: '0px 16px 8px 8px', display: 'block' }

  constructor(props: any) {
    super(props)
    this.state = { valueRenderWidth: 300 }
  }

  private registerUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.subscribe(this.updateNode)
    node.onMessage.subscribe(this.updateNode)
  }

  private removeUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.unsubscribe(this.updateNode)
    node.onMessage.unsubscribe(this.updateNode)
  }

  private renderTopicDeleteButton() {
    if (!this.props.node || (!this.props.node.message || !this.props.node.message.value)) {
      return null
    }

    return (
      <CustomIconButton onClick={() => this.deleteTopic(this.props.node)} tooltip="Clear this topic">
        <Delete style={{ marginTop: '-3px' }} />
      </CustomIconButton>
    )
  }

  private renderRecursiveTopicDeleteButton() {
    const deleteLimit = 50
    const topicCount = this.props.node ? this.props.node.childTopicCount() : 0
    if (!this.props.node || topicCount === 0 || (this.props.node.message && topicCount === 1)) {
      return null
    }

    return (
      <Badge
        classes={{ badge: this.props.classes.badge }}
        badgeContent={<span style={{ whiteSpace: 'nowrap' }}>{topicCount >= deleteLimit ? '50+' : topicCount}</span>}
        color="secondary"
      >
        <CustomIconButton
          onClick={() => this.deleteTopic(this.props.node, true, deleteLimit)}
          tooltip={`Deletes up to ${deleteLimit} sub-topics with a single click`}
        >
          <Delete style={{ marginTop: '-3px' }} color="action" />
        </CustomIconButton>
      </Badge>
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
            <Typography className={classes.heading}>
              Topic {copyTopic} {deleteTopic} {deleteRecursiveTopic}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <Topic node={this.props.node} didSelectNode={this.updateNode} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ValuePanel lastUpdate={this.props.node ? this.props.node.lastUpdate : 0} />
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summaryStyle}>
            <Typography className={classes.heading}>Publish</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Publish connectionId={this.props.connectionId} />
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

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.removeUpdateListener(this.props.node)
    nextProps.node && this.registerUpdateListener(nextProps.node)

    if (this.props.node !== nextProps.node) {
      this.setState({ compareMessage: undefined })
    }
  }

  public componentWillUnmount() {
    this.props.node && this.removeUpdateListener(this.props.node)
  }

  public render() {
    return (
      <div id="Sidebar" className={this.props.classes.drawer}>
        {this.renderNode()}
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    node: state.tree.get('selectedTopic'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActions, dispatch),
    settingsActions: bindActionCreators(settingsActions, dispatch),
  }
}

const styles = (theme: Theme) => ({
  drawer: {
    display: 'block' as 'block',
  },
  badge: {
    top: '3px',
    right: '3px',
  },
  valuePaper: {
    margin: theme.spacing(1),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

export default withStyles(styles)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Sidebar)
)
