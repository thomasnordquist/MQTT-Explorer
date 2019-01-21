import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { AppState } from '../../reducers'
import { Theme, withTheme } from '@material-ui/core/styles'

import TreeNode from './TreeNode'
import { connect } from 'react-redux'
import { TopicOrder } from '../../reducers/Settings'

export interface Props {
  lastUpdate: number
  topicOrder?: TopicOrder
  animateChanges: boolean
  treeNode: q.TreeNode
  autoExpandLimit: number
  collapsed?: boolean | undefined
  didSelectNode?: (node: q.TreeNode) => void
  theme: Theme
}

class TreeNodeSubnodes extends React.Component<Props, {}> {
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

  public render() {
    const edges = Object.values(this.props.treeNode.edges)
    if (edges.length === 0 || this.props.collapsed) {
      return null
    }

    const listItemStyle = {
      padding: '3px 0px 0px 8px',
    }

    const nodes = this.sortedNodes()
    const listItems = nodes.map(node => (
        <div key={node.hash()}>
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
  }
}

export default withTheme()(connect(mapStateToProps)(TreeNodeSubnodes))
