import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TreeNode from './TreeNode'
import { Record } from 'immutable'
import { SettingsState, TopicOrder } from '../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core'
import { TopicViewModel } from '../../model/TopicViewModel'

export interface Props {
  treeNode: q.TreeNode<TopicViewModel>
  filter?: string
  collapsed?: boolean | undefined
  classes: any
  lastUpdate: number
  selectedTopic?: q.TreeNode<TopicViewModel>
  didSelectTopic: any
  settings: Record<SettingsState>
}

interface State {
  alreadyAdded: number
}

class TreeNodeSubnodes extends React.Component<Props, State> {
  private renderMoreAnimationFrame?: any
  constructor(props: Props) {
    super(props)
    this.state = { alreadyAdded: 10 }
  }

  private sortedNodes(): Array<q.TreeNode<TopicViewModel>> {
    const { settings, treeNode } = this.props
    const topicOrder = settings.get('topicOrder')

    let edges = treeNode.edgeArray
    if (topicOrder === TopicOrder.abc) {
      edges = edges.sort((a, b) => a.name.localeCompare(b.name))
    }

    let nodes = edges.map(edge => edge.target)
    if (topicOrder === TopicOrder.messages) {
      nodes = nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
    }
    if (topicOrder === TopicOrder.topics) {
      nodes = nodes.sort((a, b) => b.childTopicCount() - a.childTopicCount())
    }

    return nodes
  }

  private renderMore() {
    this.renderMoreAnimationFrame = (window as any).requestIdleCallback(
      () => {
        this.setState({ ...this.state, alreadyAdded: this.state.alreadyAdded * 1.5 })
      },
      { timeout: 500 }
    )
  }

  public componentWillUnmount() {
    ;(window as any).cancelIdleCallback(this.renderMoreAnimationFrame)
  }

  public render() {
    const edges = this.props.treeNode.edgeArray
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    if (this.state.alreadyAdded < edges.length) {
      this.renderMore()
    }

    const nodes = this.sortedNodes().slice(0, this.state.alreadyAdded)
    const listItems = nodes.map(node => {
      return (
        <TreeNode
          key={`${node.hash()}-${this.props.filter}`}
          treeNode={node}
          className={this.props.classes.listItem}
          lastUpdate={node.lastUpdate}
          didSelectTopic={this.props.didSelectTopic}
          settings={this.props.settings}
        />
      )
    })

    return <span className={this.props.classes.list}>{listItems}</span>
  }
}

const styles = (theme: Theme) => ({
  list: {
    display: 'block' as 'block',
    clear: 'both' as 'both',
    marginLeft: theme.spacing(1.5),
  },
})

export default withStyles(styles)(TreeNodeSubnodes)
