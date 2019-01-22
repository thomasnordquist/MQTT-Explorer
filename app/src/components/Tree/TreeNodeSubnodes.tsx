import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { AppState } from '../../reducers'

import TreeNode from './TreeNode'
import { connect } from 'react-redux'
import { TopicOrder } from '../../reducers/Settings'

export interface Props {
  lastUpdate: number
  topicOrder?: TopicOrder
  animateChanges: boolean
  treeNode: q.TreeNode
  autoExpandLimit: number
  filter?: string
  collapsed?: boolean | undefined
  didSelectNode?: (node: q.TreeNode) => void
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

  private sortedNodes(): q.TreeNode[] {
    const { topicOrder, treeNode } = this.props

    let edges = Object.values(treeNode.edges)
    if (topicOrder === TopicOrder.abc) {
      edges = edges.sort((a, b) => a.name.localeCompare(b.name))
    }

    let nodes = edges.map(edge => edge.target)
    if (topicOrder === TopicOrder.messages) {
      nodes = nodes.sort((a, b) => b.leafMessageCount() - a.leafMessageCount())
    }
    if (topicOrder === TopicOrder.topics) {
      nodes = nodes.sort((a, b) => b.leafCount() - a.leafCount())
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
    const edges = Object.values(this.props.treeNode.edges)
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    if (this.state.alreadyAdded < edges.length) {
      const delta = Math.min(this.state.alreadyAdded, edges.length - this.state.alreadyAdded)
      this.renderMore()
    }

    const listItemStyle = {
      padding: '3px 0px 0px 8px',
    }

    const nodes = this.sortedNodes().slice(0, this.state.alreadyAdded)
    const listItems = nodes.map(node => (
      <div key={`${node.hash()}-${this.props.filter}`}>
        <TreeNode
          animateChages={this.props.animateChanges}
          treeNode={node}
          lastUpdate={node.lastUpdate}
          style={listItemStyle}
        />
      </div>
    ))

    return (
      <span style={{ display: 'block', clear: 'both' }} >
        {listItems}
      </span>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    topicOrder: state.settings.topicOrder,
    filter: state.tree.filter,
  }
}

export default connect(mapStateToProps)(TreeNodeSubnodes)
