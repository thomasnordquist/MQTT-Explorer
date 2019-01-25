import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { AppState } from '../../reducers'

import TreeNode from './TreeNode'
import { connect } from 'react-redux'
import { TopicOrder } from '../../reducers/Settings'
import { Theme, withStyles } from '@material-ui/core'
import { TopicViewModel } from '../../TopicViewModel'

export interface Props {
  animateChanges: boolean
  treeNode: q.TreeNode<TopicViewModel>
  filter?: string
  collapsed?: boolean | undefined
  classes: any

  lastUpdate: number

  topicOrder: TopicOrder
  selectedTopic?: q.TreeNode<TopicViewModel>
  autoExpandLimit: number
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

  private sortedNodes(): q.TreeNode<TopicViewModel>[] {
    const { topicOrder, treeNode } = this.props

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
    this.renderMoreAnimationFrame = window.requestAnimationFrame(() => {
      this.setState({ ...this.state, alreadyAdded: this.state.alreadyAdded * 1.5 })
    })
  }

  public componentWillUnmount() {
    window.cancelAnimationFrame(this.renderMoreAnimationFrame)
  }

  public render() {
    const edges = this.props.treeNode.edgeArray
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    if (this.state.alreadyAdded < edges.length) {
      const delta = Math.min(this.state.alreadyAdded, edges.length - this.state.alreadyAdded)
      this.renderMore()
    }

    const nodes = this.sortedNodes().slice(0, this.state.alreadyAdded)
    const listItems = nodes.map((node) => {
      return (
        <TreeNode
          key={`${node.hash()}-${this.props.filter}`}
          animateChages={this.props.animateChanges}
          treeNode={node}
          className={this.props.classes.listItem}
          topicOrder={this.props.topicOrder}
          autoExpandLimit={this.props.autoExpandLimit}
          lastUpdate={node.lastUpdate}
        />
      )
    })

    return (
      <span className={this.props.classes.list}>
        {listItems}
      </span>
    )
  }
}

const styles = (theme: Theme) => ({
  list: {
    display: 'block' as 'block',
    clear: 'both' as 'both',
  },
  listItem: {
    padding: '3px 0px 0px 8px',
  },
})

export default withStyles(styles)(TreeNodeSubnodes)
